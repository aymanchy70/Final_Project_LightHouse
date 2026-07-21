import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipTypeList } from './membership-type-list';

describe('MembershipTypeList', () => {
  let component: MembershipTypeList;
  let fixture: ComponentFixture<MembershipTypeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipTypeList],
    }).compileComponents();

    fixture = TestBed.createComponent(MembershipTypeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
