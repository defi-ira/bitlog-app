import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BitLogAppComponent } from './bit-log-app/bit-log-app.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ContractService } from './services/ContractService';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    BitLogAppComponent
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  providers: [ContractService],
  bootstrap: [BitLogAppComponent]
})
export class AppModule { }
