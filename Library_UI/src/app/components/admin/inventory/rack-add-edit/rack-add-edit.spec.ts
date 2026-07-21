import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RackAddEdit } from './rack-add-edit';

describe('RackAddEdit', () => {
  let component: RackAddEdit;
  let fixture: ComponentFixture<RackAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RackAddEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RackAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
