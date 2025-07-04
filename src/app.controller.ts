import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/start-throttle-test')
  async startThrottleTest() {
    console.log('Starting throttle test...');
    // Call the service method to start the throttle test
    return this.appService.startThrottleTest();
  }
}
