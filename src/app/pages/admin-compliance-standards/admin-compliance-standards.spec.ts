import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComplianceStandards } from './admin-compliance-standards';

describe('AdminComplianceStandards', () => {
  let component: AdminComplianceStandards;
  let fixture: ComponentFixture<AdminComplianceStandards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComplianceStandards],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComplianceStandards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
