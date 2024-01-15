export class TleFindPathReq {
    readonly targetDateObj: Date;
  }
  
  export class TleFindQueryReq {
    readonly page?: number;
  
    readonly limit?: number;
  
    readonly chunk?: number;
  
    readonly noradId?: number;
  
    readonly noradIds?: Array<number>;
  }