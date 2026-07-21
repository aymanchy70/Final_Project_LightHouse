import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherList } from './publisher-list';

describe('PublisherList', () => {
  let component: PublisherList;
  let fixture: ComponentFixture<PublisherList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublisherList],
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
