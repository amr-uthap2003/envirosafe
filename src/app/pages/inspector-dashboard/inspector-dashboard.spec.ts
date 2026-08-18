import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectorDashboard } from './inspector-dashboard';

describe('InspectorDashboard', () => {
  let component: InspectorDashboard;
  let fixture: ComponentFixture<InspectorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectorDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(InspectorDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
