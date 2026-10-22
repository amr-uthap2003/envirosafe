import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeReadings } from './employee-readings';

describe('EmployeeReadings', () => {
  let component: EmployeeReadings;
  let fixture: ComponentFixture<EmployeeReadings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeReadings],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeReadings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
