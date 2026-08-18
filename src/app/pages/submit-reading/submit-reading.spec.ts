import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitReading } from './submit-reading';

describe('SubmitReading', () => {
  let component: SubmitReading;
  let fixture: ComponentFixture<SubmitReading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitReading],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitReading);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
