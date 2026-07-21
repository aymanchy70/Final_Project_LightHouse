import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorAddEdit } from './author-add-edit';

describe('AuthorAddEdit', () => {
  let component: AuthorAddEdit;
  let fixture: ComponentFixture<AuthorAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorAddEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
