import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataPoint } from './series.model';

@Injectable({
  providedIn: 'root',
})
export class SeriesCollectorService {
  private numCharts: number | null = null;

  private data$ = new BehaviorSubject<{
    seriesKey: string;
    data: DataPoint;
  }>({ seriesKey: null, data: null });

  numCharts$ = this.data$.asObservable().pipe(

  )

  registerNumCharts(n: number) {
    this.numCharts = n;
  }
}
