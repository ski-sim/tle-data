import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TLEDataDTO } from  '../dto/tle.dto';
import { MongoClient } from 'mongodb';

@Injectable()
export class AppService {

  
  private dbClient: MongoClient;

  constructor() {
    // Replace 'your_mongodb_connection_string' with your actual connection string
    this.dbClient = new MongoClient('mongodb://spacemap42:Voronoi1!@121.78.75.22:27017/?directConnection=true');

  }

  async connectToDb() {
    try {
      await this.dbClient.connect();
      console.log('Connected successfully to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error.message);
    }
  }

  async insertTLEData(tleDataList: TLEDataDTO[]) {
    try {
      const database = this.dbClient.db('kyuil-workspace');
      const collection = database.collection('tle');

      // Transform the TLEDataDTO objects into the structure needed for your MongoDB documents
      const documents = tleDataList.map((data) => ({
        objectName: data.objectName,
        noradId: data.noradId,
        line2: data.line2,
        line3: data.line3,
        // Other fields can be added here as necessary
        creationDate: new Date(), // Example field
      }));

      const result = await collection.insertMany(documents);
      console.log(`Inserted ${result.insertedCount} documents into the collection.`);
    } catch (error) {
      console.error('Error inserting documents:', error.message);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getTLEData() {
    const configUsr = 'wewe1117@hanyang.ac.kr';
    const configPwd = 'kyuil1234567890';
    const siteCred = { identity: configUsr, password: configPwd };

    try {
      // Set up an Axios session
      const session = axios.create({
        baseURL: 'https://www.space-track.org',
        withCredentials: true,
      });

      // Log in
      const loginResponse = await session.post('/ajaxauth/login', siteCred);
      if (loginResponse.status !== 200) {
        console.error('Error, POST fail on login');
        return;
      }

      /*
        session 인스턴스에 쿠키가 올바르게 설정되어야 합니다. 
        일반적으로 axios.create를 사용하여 생성된 세션은 로그인 응답의 Set-Cookie 헤더에서 받은 쿠키를 자동으로 추적하지 않습니다. 
        따라서 쿠키를 수동으로 관리해야 할 수 있습니다.
      */
      const cookie = loginResponse.headers['set-cookie'];
      if (cookie) {
        session.defaults.headers.Cookie = cookie.join('; ');
      } else {
        console.log('Error, No cookie found in response.');
      }

      const queryResponse = await session.get(
        `https://www.space-track.org/basicspacedata/query/class/gp/EPOCH/%3Enow-30/MEAN_MOTION/%3E11.25/ECCENTRICITY/%3C0.25/OBJECT_TYPE/payload/orderby/NORAD_CAT_ID,EPOCH/format/3le`,
      );
      if (queryResponse.status !== 200) {
        console.log('Query Response Status:', queryResponse.status);
        console.error('Error, GET fail on request');
        return;
      }

      // Process the data
      const data = queryResponse.data;
      const tleDataList: TLEDataDTO[] = [];
      const lines = data.split('\n'); // Split the data into lines
      
      for (let i = 0; i < lines.length; i += 3) {
        // Ensure there are enough lines to form a complete record
        if (i + 2 < lines.length) {
          const tleData = new TLEDataDTO(lines[i], lines[i + 1], lines[i + 2]);
          tleDataList.push(tleData);
        }
      }
      
      tleDataList.forEach((tleData, index) => {
        
        console.log(`objectName: ${tleData.objectName}`);
        console.log(`noradId: ${tleData.noradId}`);
        console.log(`Line 2: ${tleData.line2}`);
        console.log(`Line 3: ${tleData.line3}`);
        console.log('-------------------');
      });
      await this.insertTLEData(tleDataList);
      // Assuming the data is in JSON format, you can access it like data.propertyName
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
    
  }
}
