import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookEditionList } from './book-edition-list';

describe('BookEditionList', () => {
  let component: BookEditionList;
  let fixture: ComponentFixture<BookEditionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookEditionList],
    }).compileComponents();

    fixture = TestBed.createComponent(BookEditionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
