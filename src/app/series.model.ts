import { Observable } from 'rxjs';

export type Filter = 'filter1' | 'filter2' | 'filter3';
export type Facet = 'facet1' | 'facet2' | 'facet3' | 'facet4';

export interface DataPoint {
  id: number;
  label: string;
  data: { facetTypes: string[], value: string }[];
}

export interface Series {
  id: string;
  filters: Filter[];
  facets: Facet[];
  dataProvider?: Observable<DataPoint[]>;
  color: string;
}
