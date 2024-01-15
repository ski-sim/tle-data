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
  constructor(private readonly tleService: TleService) {}


  @Post('/tle')
  async getTLEData() {
    return await this.tleService.getTLEData();
  }

  @Get('/tle/:noradId')
  async getTleByNoradId(@Param('noradId') noradId: string) {
    const tleData = await this.tleService.findTleByNoradId(noradId);
    if (!tleData) {
      throw new NotFoundException(`TLE with noradId ${noradId} not found.`);
    }
    
    return tleData;
  }

  @Get('/tles')
  async getAllTles() {
    return await this.tleService.findAllTles();
  }
}
