import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    const date = new Date(value);
    const monthIndexOffset = 1;
    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + monthIndexOffset);
    const year = date.getFullYear();

    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  }

  padZero(value: number): string {
    const threshold = 10;
    return value < threshold ? `0${value}` : `${value}`;
  }
}
