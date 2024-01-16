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
import {  BadRequestException } from '@nestjs/common';
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

  @Get('/tle/query/noradId/:noradId')
  async getTleByNoradId(@Param('noradId') noradId: string) {
    const tleData : TleFindDto = await this.tleService.findTleByNoradId(noradId);
    if (!tleData) {
      throw new NotFoundException(`TLE with noradId ${noradId} not found.`);
    }
    
    return tleData;
  }


  @Get('/tle/query/noradId/:direction/:noradId')
  async getTleLessThanNoradId(@Param('direction') direction: '>'|'<', @Param('noradId') noradId: string): Promise<TleFindDto[]> {
    if (direction === '>') {
      return this.tleService.findTleGreaterThanNoradId(noradId);
    } else if (direction === '<') {
      return this.tleService.findTleLessThanNoradId(noradId);
    } else {
      throw new BadRequestException('Invalid direction. Use "greater" or "less".');
    }
  }


  @Get('/tles')
  async getAllTles() {
    return await this.tleService.findAllTles();
  }

  @Delete('/tle/query/date/:year/:month/:date/:hours/:minutes')
  async deleteTleByDate(
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('date') date: string,
    @Param('hours') hours: string,
    @Param('minutes') minutes: string
  ): Promise<void> {
    const deletionStartDate = new Date(`${year}-${month}-${date}T${hours}:${minutes}:00.000+00:00`);
    const deletionEndDate = new Date(`${year}-${month}-${date}T${hours}:${minutes}:59.999+00:00`);

    // Call the service method to delete data based on the specified date
    const deletedCount = await this.tleService.deleteTleByDate(deletionStartDate,deletionEndDate);

    if (deletedCount === 0) {
      throw new NotFoundException(`No TLEs found for the specified date: ${deletionStartDate.toISOString()}`);
    }
  }

  @Delete('/tle/query/noradId/:noradId')
  async deleteTleByNoradId( @Param('noradId') noradId: string): Promise<void>  {
    return this.tleService.deleteTleByNoradId(noradId);

  }

  @Delete('/tle/query/noradId/:direction/:noradId')
  async deleteTleLessThanNoradId(@Param('direction') direction: '>'|'<', @Param('noradId') noradId: string): Promise<void>  {
    if (direction === '>') {
      return this.tleService.deleteTleGreaterThanNoradId(noradId);
    } else if (direction === '<') {
      await this.tleService.deleteTleLessThanNoradId(noradId);
    } else {
      throw new BadRequestException('Invalid direction. Use "greater" or "less".');
    }
  }
    
    
    
    
    // Add any response logic or error handling as needed
  
}
