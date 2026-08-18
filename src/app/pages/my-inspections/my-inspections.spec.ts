import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyInspections } from './my-inspections';

describe('MyInspections', () => {
  let component: MyInspections;
  let fixture: ComponentFixture<MyInspections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyInspections],
    }).compileComponents();

    fixture = TestBed.createComponent(MyInspections);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
