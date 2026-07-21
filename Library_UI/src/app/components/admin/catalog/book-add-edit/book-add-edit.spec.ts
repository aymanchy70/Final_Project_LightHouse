import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookAddEdit } from './book-add-edit';

describe('BookAddEdit', () => {
  let component: BookAddEdit;
  let fixture: ComponentFixture<BookAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookAddEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(BookAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
