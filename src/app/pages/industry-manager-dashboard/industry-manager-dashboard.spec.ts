import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryManagerDashboard } from './industry-manager-dashboard';

describe('IndustryManagerDashboard', () => {
  let component: IndustryManagerDashboard;
  let fixture: ComponentFixture<IndustryManagerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryManagerDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(IndustryManagerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
