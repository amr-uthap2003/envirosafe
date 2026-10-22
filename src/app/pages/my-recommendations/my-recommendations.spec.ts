import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRecommendations } from './my-recommendations';

describe('MyRecommendations', () => {
  let component: MyRecommendations;
  let fixture: ComponentFixture<MyRecommendations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRecommendations],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRecommendations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
