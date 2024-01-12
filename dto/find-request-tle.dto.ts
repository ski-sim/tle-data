export class TleFindPathReq {
    readonly targetDateObj: Date;
  }
  
  export class TleFindQueryReq {
    readonly page?: number;
  
    readonly limit?: number;
  
    readonly chunk?: number;
  
    readonly id?: number;
  
    readonly ids?: Array<number>;
  }