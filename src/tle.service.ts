import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import {  TleDto, TleGetDto, TleFindDto } from  '../dto/tle.dto';
import { MongoClient } from 'mongodb';
import { Tle, TleDocument} from '../schemas/tle.schema';


@Injectable()
export class TleService {

  private dbClient: MongoClient;

  constructor(@InjectModel(Tle.name) private tleModel: Model<TleDocument>) {
    this.dbClient = new MongoClient('mongodb://spacemap42:Voronoi1!@121.78.75.22:27017/?directConnection=true');
    
  }

  async findTleForTargetNoradId(ids?: Array<number>): Promise<TleFindDto> {
    const database = this.dbClient.db('kyuil-workspace');
    const collection = database.collection('tle');
    const tle = await this.tleModel.findOne({}).sort({ date: -1 }).exec();
    const date = new Date(tle.creationDate);
    const tles = await this.tleModel.find({ date, id: { $in: ids } }).exec();
    const tleDtos = ids.map(
      (id) => new TleDto(tles.filter((tle) => tle.id === id)[0]),
    );
    return new TleFindDto(date, date, tleDtos);
  }

  async createTle(tleData: Tle): Promise<Tle> {
    const newTle = new this.tleModel(tleData);
    return newTle.save();
  }
  async connectToDb() {
    try {
      await this.dbClient.connect();
      console.log('Connected successfully to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error.message);
    }
  }

  async getTLEData() {
    const configUsr = 'wewe1117@hanyang.ac.kr';
    const configPwd = 'kyuil1234567890';
    const siteCred = { identity: configUsr, password: configPwd };

    try {
      
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
        `https://www.space-track.org/basicspacedata/query/class/gp/EPOCH/>now-30/orderby/NORAD_CAT_ID,EPOCH/format/3le`,
      );
      if (queryResponse.status !== 200) {
        console.log('Query Response Status:', queryResponse.status);
        console.error('Error, GET fail on request');
        return;
      }

      // Process the data
      const data = queryResponse.data;
      const tleDataList: TleGetDto[] = [];
      const lines = data.split('\n'); // Split the data into lines
      console.log('number of Rso :', lines.length);
      for (let i = 0; i < lines.length; i += 3) {
        // Ensure there are enough lines to form a complete record
        if (i + 2 < lines.length) {
          const tleData = new TleGetDto(lines[i], lines[i + 1], lines[i + 2]);
          tleDataList.push(tleData);
        }
      }
      
      
      await this.insertTleData(tleDataList);
      // Assuming the data is in JSON format, you can access it like data.propertyName
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
    
  }
  async insertTleData(tleDataList: TleGetDto[]) {
    try {
      const database = this.dbClient.db('kyuil-workspace');
      const collection = database.collection('tle');
      await collection.deleteMany({});
      // Transform the TLEDataDTO objects into the structure needed for your MongoDB documents
      const documents = tleDataList.map((tleData) => ({
        creationDate: tleData.date, 
        objectName: tleData.objectName,
        noradId: tleData.noradId,
        tleFirstLine: tleData.tleLine1,
        tleSecondLine: tleData.tleLine2,
        // Other fields can be added here as necessary
        // Example field
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

  

  // async findTleForTargetNoradId(noradId: string): Promise<Tle[]> {
  //   try {
  //     const noradIdNumber = parseInt(noradId, 10);
  //     const foundTles = await this.tleModel.find({ noradId: noradIdNumber }).exec();
      
  //     // foundTles가 비어있는지 확인합니다.
  //     if (!foundTles || foundTles.length === 0) {
  //       // 적절한 처리를 수행합니다. 예를 들면:
  //       // throw new NotFoundException(`TLE with noradId ${noradId} not found.`);
  //       // 또는 빈 배열을 반환할 수도 있습니다.
  //       return [];
  //     }
  
  //     // 결과를 반환하기 전에 추가적인 처리를 할 수 있습니다.
  //     return foundTles;
  //   } catch (error) {
  //     console.error('Error retrieving TLE data:', error.message);
  //     // 오류 처리를 위해 예외를 던지거나, 빈 배열을 반환합니다.
  //     throw error;
  //   }
  // }
  async handleTleData(noradId: string) {
    // 여기에 NORAD ID를 처리하는 로직 추가
    // 예: 데이터베이스에서 해당 NORAD ID의 TLE 데이터 찾기
    const tleData = await this.findTLEByNoradId(noradId);

    // 필요한 경우 데이터베이스에 저장
    if (tleData.length === 0) {
      // 여기에 새로운 TLE 데이터를 데이터베이스에 저장하는 로직 추가
    }

    return tleData; // 처리된 TLE 데이터 반환
  }
  async findTLEByNoradId(noradId: string): Promise<Tle[]> {
    try {
      
      
      const noradIdNumber = parseInt(noradId, 10);
      const foundTles = await this.tleModel.find({ noradId: noradIdNumber }).exec();
      console.log(foundTles); // 이제 여기서 바로 데이터를 볼 수 있습니다.
      return foundTles;
    } catch (error) {
      console.error('Error retrieving TLE data:', error.message);
      return [];
    }
  }

 
}
