import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemCategoryAddEditComponent } from './item-category-add-edit';

describe('ItemCategoryAddEditComponent', () => {
  let component: ItemCategoryAddEditComponent;
  let fixture: ComponentFixture<ItemCategoryAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemCategoryAddEditComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCategoryAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
