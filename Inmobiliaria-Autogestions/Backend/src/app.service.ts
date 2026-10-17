import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'success',
      message: '¡Backend NestJS conectado exitosamente con el Frontend!',
      timestamp: new Date().toISOString(),
    };
  }
}
