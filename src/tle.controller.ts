import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Query,
  Post,NotFoundException 
} from '@nestjs/common';

import { TleService } from './tle.service';
import { TleFindDto } from 'dto/tle.dto';
import { TleFindPathReq, TleFindQueryReq } from 'dto/find-request-tle.dto';
import { TleFindRes } from 'dto/response-tle.dto';
import { Tle } from 'schemas/tle.schema';

@Controller()
export class TleController {
  constructor(private readonly appService: TleService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/tle')
  async getTLEData() {
    return await this.appService.getTLEData();
  }

  // @Get('/tle/:noradId')
  // async findTleForTargetNoradId(@Param('noradId') noradId: string) {
  //   const foundTles = await this.appService.findTleForTargetNoradId(noradId);

  //   if (foundTles.length === 0) {
  //     // 데이터가 없을 때 NotFoundException을 던집니다.
  //     throw new NotFoundException(`TLE with noradId ${noradId} not found.`);
  //   }

  //   // 찾은 TLE 데이터를 반환합니다.
  //   return foundTles;
  // }
  @Post('/tle')
  async findTleForTargetNoradId(
    @Body() TleFindQueryReq: TleFindQueryReq,
  ): Promise<TleFindRes> {
    const { ids } = TleFindQueryReq;
    const tleFindDto: TleFindDto =
      await this.appService.findTleForTargetNoradId(ids);
    return new TleFindRes(tleFindDto);
  }
  @Post('/tle/:noradId')
  async getTleByNoradId(@Param('noradId') noradId: string) {
    console.log(noradId);
    return await this.appService.findTLEByNoradId(noradId);
  }

  // @Post('/tle')
  // async findTleForTargetNoradId(
  //   @Body() TleFindQueryReq: TleFindQueryReq,
  // ): Promise<TleFindRes> {
  //   const { ids } = TleFindQueryReq;
  //   const tleFindDto: TleFindDto =
  //     await this.appService.findTleForTargetNoradId(ids);
  //   return new TleFindRes(tleFindDto);
  // }

  // @Post()
  // async createOrFindTle(@Body() tleData: Tle): Promise<Tle> {
  //   let tle = await this.appService.findTLEByNoradId(tleData.noradId.toString());
  //   if (tle.length === 0) {
  //     tle = [await this.appService.createTle(tleData)];
  //   }
  //   return tle[0];
  // }
  // @Post('/tle')
  // async createTleData(@Body('noradId') noradId: string) {
  //   return await this.appService.handleTleData(noradId);
  // }

}
