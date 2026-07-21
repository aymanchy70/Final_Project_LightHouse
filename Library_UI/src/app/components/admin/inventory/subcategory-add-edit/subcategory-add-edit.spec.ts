import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategoryAddEdit } from './subcategory-add-edit';

describe('SubcategoryAddEdit', () => {
  let component: SubcategoryAddEdit;
  let fixture: ComponentFixture<SubcategoryAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubcategoryAddEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(SubcategoryAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
