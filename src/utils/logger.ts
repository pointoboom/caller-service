import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE_PATH = path.join(process.cwd(), 'call_log.txt');

export class Logger {
  private static instance: Logger;

  private constructor() {
    // Ensure the log file exists or is created
    fs.writeFileSync(LOG_FILE_PATH, '', { flag: 'a+' });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(message: string): void {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(
      LOG_FILE_PATH,
      `[${timestamp}] ${message}
`,
    );
  }
}
