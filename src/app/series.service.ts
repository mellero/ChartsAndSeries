import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, mergeMap, scan, tap } from 'rxjs/operators';
import { DataPoint, Filter, Facet, Series } from './series.model';

interface Search {
  filters: Filter[];
  facets: Facet[];
}

interface SearchResult {
  search: Search;
  data: Observable<DataPoint[]>;
}

export interface SeriesData {
  seriesKey: string;
  data: DataPoint[];
}

@Injectable()
export class SeriesService {
  // Map<hash, Search>
  private refreshList = new Map<string, SearchResult>();
  // Map<hash, Cache>
  private cache = new Map<string, SearchResult>();

  /**
   * takes a series or series[]
   *
   * Hash series query
   * - Check each series against Refresh Queue
   *    - If in RQ
   *      - Compare facets and merge facets
   * - Check each series against Cache
   *    - If in Cache
   *      - If series facets are included in Cache, return data
   *      - else pull down cache into RQ and merge facets
   * - If RQ has any entries, send API call, put return data into cache
   */
  public getAll(series: Series[]): Observable<SeriesData> {
    this.refreshList.clear();

    series.forEach((single) => {
      const hash = this.hash(single);
      const searchResult = this.do(single, hash);
      this.cache.set(hash, searchResult);
    });
    return from(this.getSeriesFromRefreshList(series)).pipe(
      mergeMap((search) =>
        search.data.pipe(
          map(
            (data) =>
              ({
                seriesKey: search.key,
                data: data,
              } as SeriesData)
          )
        )
      )
    );
  }

  public getSingleSeries(series: Series): Observable<DataPoint[]> {
    this.refreshList.clear();
    const hash = this.hash(series);
    const searchResult = this.do(series, hash);
    this.cache.set(hash, searchResult);
    return searchResult.data;
  }

  private do(series: Series, hash: string): SearchResult {
    if (this.refreshList.has(hash)) {
      return this.mergeRefreshSeries(series, hash);
    } else if (this.cache.has(hash)) {
      const cachedItem = this.cache.get(hash);
      if (this.facetsIncludedInCachedSearch(series.facets, cachedItem.search)) {
        return cachedItem;
      } else {
        const mergedFacets = this.mergeFacets(
          series.facets,
          cachedItem.search.facets
        );
        const search = {
          filters: series.filters,
          facets: mergedFacets,
        };
        return this.setRefreshList(search, hash);
      }
    } else {
      // Not in RQ or Cache, series is a new unique query
      const search = {
        filters: series.filters,
        facets: series.facets,
      };
      return this.setRefreshList(search, hash);
    }
  }

  private setRefreshList(search: Search, hash: string): SearchResult {
    const searchResult = {
      search: search,
      data: this.apiCall(search),
    };
    console.log('setting', hash, searchResult);
    this.refreshList.set(hash, searchResult);
    return searchResult;
  }

  private facetsIncludedInCachedSearch(
    facets: Facet[],
    cache: Search
  ): boolean {
    return facets.every((facet) => cache.facets.includes(facet));
  }

  private mergeRefreshSeries(seriesToMerge: Series, hash: string) {
    // Either same query or need to merge
    const refreshQuery = this.refreshList.get(hash);
    const mergedFacets = this.mergeFacets(
      seriesToMerge.facets,
      refreshQuery.search.facets
    );

    const search = {
      filters: refreshQuery.search.filters,
      facets: mergedFacets,
    };

    return this.setRefreshList(search, hash);
  }

  private mergeFacets(existing: Facet[], newFacets: Facet[]): Facet[] {
    const res = Array.from(new Set(existing.concat(newFacets))) as Facet[];
    return res;
  }

  private hash(series: Series): string {
    return series.filters.sort().join('.');
  }

  private apiCall(search: Search): Observable<DataPoint[]> {
    return of(
      search.filters.map((f, i) => ({
        id: i,
        label: f,
        data: search.facets.map((fac) => ({
          facetTypes: [fac],
          value: f + '.' + fac,
        })),
      }))
    );
  }

  private getSeriesFromRefreshList(
    series: Series[]
  ): { key: string; data: Observable<DataPoint[]> }[] {
    return series.map((s) => {
      const hash = this.hash(s);
      return {
        key: s.id,
        data: this.refreshList.get(this.hash(s)).data,
      };
    });
  }
}
