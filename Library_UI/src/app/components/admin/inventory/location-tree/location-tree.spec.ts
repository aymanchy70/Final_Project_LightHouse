import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationTreeComponent } from './location-tree';

describe('LocationTreeComponent', () => {
  let component: LocationTreeComponent;
  let fixture: ComponentFixture<LocationTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationTreeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationTreeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});