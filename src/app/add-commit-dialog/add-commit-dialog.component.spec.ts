import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommitDialogComponent } from './add-commit-dialog.component';

describe('AddCommitDialogComponent', () => {
  let component: AddCommitDialogComponent;
  let fixture: ComponentFixture<AddCommitDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCommitDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCommitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
