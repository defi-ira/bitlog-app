import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ContractService } from './services/ContractService';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatSelectModule } from '@angular/material/select';
import { CheckComponent } from './check/check.component';
import { AddCommitDialogComponent } from './add-commit-dialog/add-commit-dialog.component';
import { CommitListComponent } from './commit-list/commit-list.component';

@NgModule({
  declarations: [
    AppComponent,
    CheckComponent,
    AddCommitDialogComponent,
    CommitListComponent
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatExpansionModule,
    MatSelectModule
  ],
  providers: [ContractService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
