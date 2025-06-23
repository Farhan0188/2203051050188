export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      context: this.context,
      message,
      data: data || {}
    };
    // In a real app, send to logging service
    console.log(JSON.stringify(logEntry));
  }

  error(message: string, error: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      context: this.context,
      level: 'ERROR',
      message,
      error: error instanceof Error ? error.stack : error
    };
    console.error(JSON.stringify(logEntry));
  }
}