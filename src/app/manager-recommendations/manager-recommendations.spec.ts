import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerRecommendations } from './manager-recommendations';

describe('ManagerRecommendations', () => {
  let component: ManagerRecommendations;
  let fixture: ComponentFixture<ManagerRecommendations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerRecommendations],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerRecommendations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
