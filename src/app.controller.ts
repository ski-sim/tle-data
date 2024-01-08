import { Controller, Get, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/tledata')
  async getTLEData() {
    return await this.appService.getTLEData();
  }

  @Post('/tledata')
  async putTLEData() {
    return await this.appService.getTLEData();
  }

}
