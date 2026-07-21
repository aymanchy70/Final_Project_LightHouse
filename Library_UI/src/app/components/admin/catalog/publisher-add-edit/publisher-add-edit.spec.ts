import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherAddEdit } from './publisher-add-edit';

describe('PublisherAddEdit', () => {
  let component: PublisherAddEdit;
  let fixture: ComponentFixture<PublisherAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublisherAddEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
