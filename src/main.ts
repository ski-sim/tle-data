import { NestFactory } from '@nestjs/core';
import { AppModule } from './tle.module';
import { TleService } from './tle.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appService = app.get(TleService);
  await appService.connectToDb();
  await app.listen(3000);
}
bootstrap();
