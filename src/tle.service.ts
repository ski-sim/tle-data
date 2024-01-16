import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import {  TleDto, TleGetDto, TleFindDto } from  '../dto/tle.dto';
import { MongoClient } from 'mongodb';
import { Tle, TleDocument} from '../schemas/tle.schema';
@Injectable()
export class TleService {
  private dbUri: string;
  private dbClient: MongoClient;

  constructor(@InjectModel(Tle.name) private tleModel: Model<TleDocument>) {
    this.dbUri = 'mongodb://spacemap42:Voronoi1!@121.78.75.22:27017/';
    this.dbClient = new MongoClient(this.dbUri);
    
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
      // await collection.deleteMany({});
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
  
  async findTleByNoradId(noradId: string): Promise<TleFindDto> {
    try {
      const noradIdInt = parseInt(noradId,10);
      
      console.log("Working on database:", this.tleModel.db.name);
      console.log("Working on collection:", this.tleModel.collection.name); // 컬렉션 이름 로그 출력
      const tleDocument = await this.tleModel.findOne({ noradId: noradIdInt });

      // const tleDocument = await this.tleModel.findOne({ noradId: noradIdInt }).exec();
      if (!tleDocument) {
        return null;
      }
      // Tle 스키마 형식으로 변환
      console.log(tleDocument);
      const tleData = new TleFindDto(
        noradIdInt,
        tleDocument.objectName,
        tleDocument.creationDate.toISOString(),
        new Date(),
        tleDocument.tleFirstLine,
        tleDocument.tleSecondLine
      );

      return tleData;
      // return tleDocument.toObject();
    } catch (error) {
      throw new Error(`Error while fetching TLE with noradId ${noradId}: ${error.message}`);
    }
  }

  async findTleGreaterThanNoradId(noradId: string): Promise<TleFindDto[]> {
    const noradIdInt = parseInt(noradId, 10);
    const tleDocuments = await this.tleModel.find({ noradId: { $gte: noradIdInt } }).exec();

    return tleDocuments.map((tleDocument) => new TleFindDto(
      tleDocument.noradId,
      tleDocument.objectName,
      tleDocument.creationDate.toISOString(),
      new Date(),
      tleDocument.tleFirstLine,
      tleDocument.tleSecondLine
    ));
  }

  async findTleLessThanNoradId(noradId: string): Promise<TleFindDto[]> {
    const noradIdInt = parseInt(noradId, 10);
    const tleDocuments = await this.tleModel
      .find({ noradId: { $lte: noradIdInt } })
      .sort({ noradId: 'asc' }) 
      .exec();

    return tleDocuments.map((tleDocument) => new TleFindDto(
      tleDocument.noradId,
      tleDocument.objectName,
      tleDocument.creationDate.toISOString(),
      new Date(),
      tleDocument.tleFirstLine,
      tleDocument.tleSecondLine
    ));
  }

  async findAllTles(): Promise<Tle[]> {
    try {
      console.log(`Connecting to DB at: ${this.dbUri}`); // MongoDB 연결 URI 로깅
      await this.dbClient.connect();
      console.log('Connected successfully to MongoDB');

      const tles = await this.tleModel.find().exec();
      console.log(`Found ${tles.length} TLEs`); // 조회된 TLE의 수 로깅
      return tles;
    } catch (error) {
      console.error(`Error while fetching all TLEs: ${error.message}`);
      throw new Error(`Error while fetching all TLEs: ${error.message}`);
    }
  }

  async deleteTleByNoradId(noradId: string): Promise<void> {
    try {
      const noradIdInt = parseInt(noradId, 10);
      
      // Delete documents with NORAD IDs less than or equal to the specified value
      await this.tleModel.deleteMany({ noradId: noradIdInt  }).exec();
      console.log(`delete noradId ${noradId}`)
    } catch (error) {
      throw new Error(`Error while deleting TLEs to noradId ${noradId}: ${error.message}`);
    }
  
  }

  async deleteTleLessThanNoradId(noradId: string): Promise<void> {
    try {
      const noradIdInt = parseInt(noradId, 10);
      
      // Delete documents with NORAD IDs less than or equal to the specified value
      await this.tleModel.deleteMany({ noradId: { $lte: noradIdInt } }).exec();
      console.log(`delete noradId ${noradId}`)
    } catch (error) {
      throw new Error(`Error while deleting TLEs less than or equal to noradId ${noradId}: ${error.message}`);
    }
  }

  async deleteTleGreaterThanNoradId(noradId: string): Promise<void> {
    try {
      const noradIdInt = parseInt(noradId, 10);
      
      // Delete documents with NORAD IDs less than or equal to the specified value
      await this.tleModel.deleteMany({ noradId: { $gte: noradIdInt } }).exec();
      console.log(`delete noradId ${noradId}`)
    } catch (error) {
      throw new Error(`Error while deleting TLEs greater than or equal to noradId ${noradId}: ${error.message}`);
    }
  }

  async deleteTleByDate(deletionStartDate: Date,deletionEndDate : Date): Promise<number> {
    try {
      // Delete documents with creationDate equal to the specified date
      const result = await this.tleModel
      .deleteMany({ creationDate: { $gte: deletionStartDate, $lte: deletionEndDate } })
      .exec();
      return result.deletedCount || 0;
    } catch (error) {
      throw new Error(`Error while deleting TLEs for date ${deletionStartDate.toISOString()}: ${error.message}`);
    }
  }
}
