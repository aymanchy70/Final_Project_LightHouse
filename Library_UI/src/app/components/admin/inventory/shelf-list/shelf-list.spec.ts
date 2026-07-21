import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShelfListComponent } from './shelf-list';

describe('ShelfListComponent', () => {
  let component: ShelfListComponent;
  let fixture: ComponentFixture<ShelfListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelfListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShelfListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});