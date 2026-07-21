import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipTypeAddEdit } from './membership-type-add-edit';

describe('MembershipTypeAddEdit', () => {
  let component: MembershipTypeAddEdit;
  let fixture: ComponentFixture<MembershipTypeAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipTypeAddEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(MembershipTypeAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
