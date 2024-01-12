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
      this.objectName = line1Parts[1]; 
  
      const line2Parts = line2.trim().split(/\s+/);
      this.noradId = parseInt(line2Parts[1], 10); 
  
      this.date = new Date(),
      this.tleLine1 = line2;
      this.tleLine2 = line3;
    }
  }

  export class TleFindDto {
    constructor(
      targetTleDate: Date,
      foundTleDate: Date,
      tleDtoarray: TleDto[],
      numOfData?: number,
    ) {
      this.targetTleDate = targetTleDate;
      this.foundTleDate = foundTleDate;
      this.numOfData = numOfData;
      this.tles = tleDtoarray;
    }
  
    targetTleDate: Date;
    foundTleDate: Date;
    numOfData: number;
    tles
  }