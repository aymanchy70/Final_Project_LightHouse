import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShelfAddEditComponent } from './shelf-add-edit';

describe('ShelfAddEditComponent', () => {
  let component: ShelfAddEditComponent;
  let fixture: ComponentFixture<ShelfAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelfAddEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShelfAddEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});