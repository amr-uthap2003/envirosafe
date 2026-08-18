import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageIndustries } from './manage-industries';

describe('ManageIndustries', () => {
  let component: ManageIndustries;
  let fixture: ComponentFixture<ManageIndustries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageIndustries],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageIndustries);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
