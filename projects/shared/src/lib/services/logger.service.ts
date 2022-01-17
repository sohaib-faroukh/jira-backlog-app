import { Injectable } from '@angular/core';
import { getCurrent } from '../utils/date.util';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  constructor() {
  }

  private getPrefix = (): string => {
    return `#####`;
  }

  private getTime = (): string => {
    return `[${getCurrent()}]`;
  }

  public info = (object: any): void => {
    console.log(`${this.getPrefix()} ${this.getTime()}: `, object);
  }

  public error = (object: any): void => {
    console.error(`${this.getPrefix()} ${this.getTime()}: `, object);
  }

  public warn = (object: any): void => {
    console.warn(`${this.getPrefix()} ${this.getTime()}: `, object);
  }


}
