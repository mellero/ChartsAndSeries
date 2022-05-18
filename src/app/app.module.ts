import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ChartComponent } from './chart.component';
import { SeriesCollectorService } from './series-collector.service';
import { SeriesService } from './series.service';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, ChartComponent],
  bootstrap: [AppComponent],
  providers: [
    SeriesCollectorService,
    SeriesService
  ]
})
export class AppModule {}
