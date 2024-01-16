import { Tle, TleDocument } from '../schemas/tle.schema';
import { IsString } from 'class-validator';
import { Types } from 'mongoose';


export class TleDto {
  constructor(
    tleModel:
      | Tle
      | (TleDocument & {
          _id: Types.ObjectId;
        }),
  ) {
    this.name = tleModel.objectName;
    this.firstLine = tleModel.tleFirstLine;
    this.secondLine = tleModel.tleSecondLine;
  }

  @IsString()
  name: string;

  @IsString()
  firstLine: string;

  @IsString()
  secondLine: string;
}

export class TleGetDto {
    date: Date;
    noradId: number;
    objectName: string;
    tleLine1: string;
    tleLine2: string;
    
    
    constructor(line1: string, line2: string, line3: string) {
      const line1Parts = line1.trim().split(/\s+/); 
      this.objectName = line1Parts[1]+' '+line1Parts[2]; 
  
      const line2Parts = line2.trim().split(/\s+/);
      this.noradId = parseInt(line2Parts[1], 10); 
  
      this.date = new Date(),
      this.tleLine1 = line2;
      this.tleLine2 = line3;
    }
  }

  export class TleFindDto {
    constructor(
      noradId : number,
      objectName : string,
      targetTleDate: string,
      currentDate: Date,
      tleFirstLine : string,
      tleSecondLine : string,
      // tleDtoarray: TleDto[],
      // numOfData?: number,
      
    ) {
      this.objectName = objectName;
      this.noradId = noradId;
      this.targetTleDate = targetTleDate;
      this.currentDate = currentDate;
      this.tleFirstLine = tleFirstLine;
      this.tleSecondLine = tleSecondLine;
      // this.numOfData = numOfData;
      // this.tles = tleDtoarray;
    }
    noradId : number;
    objectName : string;
    targetTleDate: string;
    currentDate: Date;
    tleFirstLine : string;
    tleSecondLine : string;
    // numOfData: number;
    // tles
  }