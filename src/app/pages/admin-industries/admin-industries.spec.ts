import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIndustries } from './admin-industries';

describe('AdminIndustries', () => {
  let component: AdminIndustries;
  let fixture: ComponentFixture<AdminIndustries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIndustries],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminIndustries);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
