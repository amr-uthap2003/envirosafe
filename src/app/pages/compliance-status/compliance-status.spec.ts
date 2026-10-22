import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceStatus } from './compliance-status';

describe('ComplianceStatus', () => {
  let component: ComplianceStatus;
  let fixture: ComponentFixture<ComplianceStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplianceStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
