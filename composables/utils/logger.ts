export class Logger {
  static DEBUG = process.env.NODE_ENV === 'development'

  private prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  info(message: string, ...args: any[]) {
    if (Logger.DEBUG)
      console.log(`[${this.prefix}] ${message}`, ...args)
  }

  error(message: string, ...args: any[]) {
    if (Logger.DEBUG)
      console.error(`[${this.prefix}] ${message}`, ...args)
  }
}
