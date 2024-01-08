export class TLEDataDTO {
 
    noradId: number;
    objectName: string;
    line2: string;
    line3: string;
  
    constructor(line1: string, line2: string, line3: string) {
      // Split the first line to extract the object name
      const line1Parts = line1.trim().split(/\s+/); // Split by one or more spaces
      this.objectName = line1Parts[1]; // Assuming the name is the first part
  
      // Split the second line to extract the NORAD ID
      const line2Parts = line2.trim().split(/\s+/);
      this.noradId = parseInt(line2Parts[1], 10); // Assuming the NORAD ID is the second part
  
  
      this.line2 = line2;
      this.line3 = line3;
    }
  }