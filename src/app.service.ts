import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '<br><br><br><br><br><br>======== ONLINE PIVETÃO! =======';
  }
}
