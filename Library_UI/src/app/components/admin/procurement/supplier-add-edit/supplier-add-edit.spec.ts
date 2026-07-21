import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierAddEdit } from './supplier-add-edit';

describe('SupplierAddEdit', () => {
  let component: SupplierAddEdit;
  let fixture: ComponentFixture<SupplierAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierAddEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
