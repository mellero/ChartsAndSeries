import { Component, Input, OnInit } from '@angular/core';
import { SeriesCollectorService } from './series-collector.service';
import { Series } from './series.model';

@Component({
  selector: 'chart',
  template: `
    <div style="border: 1px solid black; width: 100px; height: 100px;">
      {{ series?.id || 'loading...' }}
      <div *ngIf="series?.dataProvider | async as data">
        <div *ngFor="let datum of data">
          <div *ngFor="let point of datum.data">
            {{ point.value }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`h1 { font-family: Lato; }`],
})
export class ChartComponent implements OnInit {
  @Input() id: string = '';
  @Input() series: Series;

  constructor() {}

  ngOnInit() {}
}
