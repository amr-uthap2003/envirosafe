import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectorReports } from './inspector-reports';

describe('InspectorReports', () => {
  let component: InspectorReports;
  let fixture: ComponentFixture<InspectorReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectorReports],
    }).compileComponents();

    fixture = TestBed.createComponent(InspectorReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
