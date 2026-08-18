import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvironmentalData } from './environmental-data';

describe('EnvironmentalData', () => {
  let component: EnvironmentalData;
  let fixture: ComponentFixture<EnvironmentalData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnvironmentalData],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvironmentalData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
