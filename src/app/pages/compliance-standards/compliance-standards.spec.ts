import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceStandards } from './compliance-standards';

describe('ComplianceStandards', () => {
  let component: ComplianceStandards;
  let fixture: ComponentFixture<ComplianceStandards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceStandards],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplianceStandards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
