import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import PQueue from 'p-queue';

import { logToFile } from './file-logger';
@Injectable()
export class AppService {
  private id = 1;
  private readonly rounds = [16, 256, 4096, 65536];
  private readonly queue: PQueue;
  private currentMinute: Date | null = null;

  constructor() {
    this.queue = new PQueue({
      concurrency: 512, // Limit to 512 concurrent requests
      interval: 1000, // 1 second interval
      intervalCap: 512, // Maximum requests per interval
    });
  }

  async startThrottleTest() {
    for (let index = 0; index < this.rounds.length; index++) {
      const now = new Date();
      const round = this.rounds[index];
      const roundStart = now.getTime();

      if (index !== 0) {
        await this.waitUntillNextMinute(now.getMinutes());
      }

      for (let i = 0; i < round; i++) {
        const currentId = this.id++;
        this.queue.add(() => this.throttleAndCallEcho(currentId));
      }

      await this.queue.onIdle(); // Wait for all tasks in the queue to complete
      const roundEnd = Date.now();
      console.log(`Round ${index + 1} took ${roundEnd - roundStart} ms`);
    }
  }

  async throttleAndCallEcho(id: number) {
    try {
      const data = id.toString();
      const sendAt = Date.now();
      const response = await axios.post('http://localhost:3006/echo', { data });
      const receiveAt = Date.now();

      logToFile(
        `ID ${id}: Response: ${response.data} Send at: ${sendAt} Receive at: ${receiveAt}`,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        logToFile(`Error for ID ${id}: ${error.message}`);
      } else {
        logToFile(`Error for ID ${id}: ${String(error)}`);
      }
    }
  }

  private async waitUntillNextMinute(previousMinute: number) {
    const now = new Date();
    const currentMinute = now.getMinutes();

    // If the current minute is the same as the previous, wait until the next minute
    if (currentMinute === previousMinute) {
      const nextMinute = new Date(now.getTime() + 60 * 1000);
      const waitTime = nextMinute.getTime() - now.getTime();
      console.log(`Waiting for ${waitTime} ms until next minute...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}
