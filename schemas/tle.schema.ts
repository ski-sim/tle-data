import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'; // 기본문서타입.

export type TleDocument = Tle & Document;

@Schema({ strict : false }) // 컬렉션 이름을 정확히 지정
export class Tle {
  @Prop({ required: true })// 필수로 입력.
  creationDate: Date;
  
  @Prop({ required: true })
  objectName: string;

  @Prop({ required: true })
  noradId: number;

  

  @Prop({ required: true })
  tleFirstLine: string;

  @Prop({ required: true })
  tleSecondLine: string;
}

export const TleSchema = SchemaFactory.createForClass(Tle);
