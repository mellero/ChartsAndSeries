import { Component, OnInit, VERSION } from '@angular/core';
import { Observable, of } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SeriesCollectorService } from './series-collector.service';
import { DataPoint, Facet, Series } from './series.model';
import { SeriesData, SeriesService } from './series.service';

/**
 * We have a list of charts that need data.
 * Each chart needs a Series, composed of a key, some meta data about the series,
 * and a data provider in the form of an observable of a DataPoint[].
 *
 * Some series may share data. Shared data means that a series' query matches another
 * series' query. Though the resource enpoint may be the same, all matching series may
 * require separate facets - that is, different permutations of the same base data.
 *
 * All required facets for a given query should be included in a single api call to
 * save resources. The series will then manipulate their own data using their facets.
 *
 * We also want to cache query data where we can to save on api calls.
 */

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
    const allData$ = this.seriesService.getAll(Object.values(this.chartMap));

    for (const series of Object.values(this.chartMap)) {
      series.dataProvider = this.filterChartData(allData$, series.id, series.facets);
    }
  }

  private filterChartData(
    allData$: Observable<SeriesData>,
    seriesId: string,
    facets: Facet[]
  ): Observable<DataPoint[]> {
    return allData$.pipe(
      filter((response) => response.seriesKey === seriesId),
      map((response) => this.filterDataByFacets(response.data, facets)),
      tap(d => console.log('data', d))
    );
  }

  private filterDataByFacets(data: DataPoint[], facets: Facet[]): DataPoint[] {
    console.log('filtering', data, facets)
    return data.map(datum => {
      return {
        ...datum,
        data: datum.data.filter(d => facets.some(f => d.facetTypes.includes(f)))
      };
    })
  }
}
