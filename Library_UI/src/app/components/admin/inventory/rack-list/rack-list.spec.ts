import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RackList } from './rack-list';

describe('RackList', () => {
  let component: RackList;
  let fixture: ComponentFixture<RackList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RackList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RackList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
