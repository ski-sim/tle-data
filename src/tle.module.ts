import { Module } from '@nestjs/common';
import { TleController } from './tle.controller';
import { TleService } from './tle.service';
import { Tle, TleSchema } from '../schemas/tle.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [ 
    MongooseModule.forRoot('mongodb://spacemap42:Voronoi1!@121.78.75.22:27017/'),
    MongooseModule.forFeature([{ name: Tle.name, schema: TleSchema }])
  ],
  controllers: [TleController],
  providers: [TleService],
  exports : [TleService]
})
export class AppModule {}
