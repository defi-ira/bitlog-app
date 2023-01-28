import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitLogAppComponent } from './bit-log-app.component';

describe('BitLogAppComponent', () => {
  let component: BitLogAppComponent;
  let fixture: ComponentFixture<BitLogAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BitLogAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BitLogAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
