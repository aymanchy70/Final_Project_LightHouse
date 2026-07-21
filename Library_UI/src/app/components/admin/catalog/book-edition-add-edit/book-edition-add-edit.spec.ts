import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookEditionAddEdit } from './book-edition-add-edit';

describe('BookEditionAddEdit', () => {
  let component: BookEditionAddEdit;
  let fixture: ComponentFixture<BookEditionAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookEditionAddEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(BookEditionAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
