import { TleFindDto } from './tle.dto';

export class TleFindRes {
  constructor(TleFindDto: TleFindDto) {
    this.result = TleFindDto;
  }
  result: TleFindDto;
}