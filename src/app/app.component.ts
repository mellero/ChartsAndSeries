import { Component, OnInit, VERSION } from '@angular/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SeriesCollectorService } from './series-collector.service';
import { DataPoint, Series } from './series.model';
import { SeriesData, SeriesService } from './series.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  chartMap: { [key: string]: Series } = {
    A: {
      id: 'A',
      filters: ['filter1'],
      facets: ['facet1', 'facet2'],
      color: 'red',
    },
    B: {
      id: 'B',
      filters: ['filter2'],
      facets: ['facet1', 'facet3'],
      color: 'blue',
    },
    C: {
      id: 'C',
      filters: ['filter1'],
      facets: ['facet1', 'facet3'],
      color: 'white',
    },
    D: {
      id: 'D',
      filters: ['filter2'],
      facets: ['facet3'],
      color: 'black',
    },
    E: {
      id: 'E',
      filters: ['filter2'],
      facets: ['facet3', 'facet4'],
      color: 'red',
    },
  };

  constructor(private seriesService: SeriesService) {}

  ngOnInit() {
    const allData$ = this.seriesService.getAll(
      Object.values(this.chartMap)
    );

    const allD$ = this.dummy();
    for (const series of Object.values(this.chartMap)) {
      series.dataProvider = this.filterChartData(allData$, series.id);
    }
  }

  private filterChartData(
    allData$: Observable<SeriesData>,
    seriesId: string
  ): Observable<DataPoint[]> {
    return allData$.pipe(
      filter((response) => response.seriesKey === seriesId),
      map((response) => response.data)
    );
  }

  dummy(): Observable<SeriesData> {
    return of(null);
  }
}
