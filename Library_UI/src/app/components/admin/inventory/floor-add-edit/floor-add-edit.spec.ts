import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorAddEdit } from './floor-add-edit';

describe('FloorAddEdit', () => {
  let component: FloorAddEdit;
  let fixture: ComponentFixture<FloorAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorAddEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
