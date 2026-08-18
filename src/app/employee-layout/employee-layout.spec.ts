import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLayout } from './employee-layout';

describe('EmployeeLayout', () => {
  let component: EmployeeLayout;
  let fixture: ComponentFixture<EmployeeLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
