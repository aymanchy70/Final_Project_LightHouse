import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemCategoryListComponent } from './item-category-list';

describe('ItemCategoryListComponent', () => {
  let component: ItemCategoryListComponent;
  let fixture: ComponentFixture<ItemCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemCategoryListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
