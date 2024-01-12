import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'; // 기본문서타입.

export type TleDocument = Tle & Document;

@Schema()
export class Tle {
  @Prop({ required: true })// 필수로 입력.
  creationDate: Date;

  @Prop({ required: true })
  noradId: number;

  @Prop({ required: true })
  objectName: string;

  @Prop({ required: true })
  tleFirstLine: string;

  @Prop({ required: true })
  tleSecondLine: string;
}

export const TleSchema = SchemaFactory.createForClass(Tle);
