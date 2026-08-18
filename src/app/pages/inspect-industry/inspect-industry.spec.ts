import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectIndustry } from './inspect-industry';

describe('InspectIndustry', () => {
  let component: InspectIndustry;
  let fixture: ComponentFixture<InspectIndustry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectIndustry],
    }).compileComponents();

    fixture = TestBed.createComponent(InspectIndustry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
