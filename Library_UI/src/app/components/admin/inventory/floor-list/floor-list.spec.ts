import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorList } from './floor-list';

describe('FloorList', () => {
  let component: FloorList;
  let fixture: ComponentFixture<FloorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
