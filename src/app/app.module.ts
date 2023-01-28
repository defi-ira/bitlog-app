import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BitLogAppComponent } from './bit-log-app/bit-log-app.component';

@NgModule({
  declarations: [
    BitLogAppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [BitLogAppComponent]
})
export class AppModule { }
