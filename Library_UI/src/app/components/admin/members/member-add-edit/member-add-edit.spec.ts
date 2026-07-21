import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberAddEdit } from './member-add-edit';

describe('MemberAddEdit', () => {
  let component: MemberAddEdit;
  let fixture: ComponentFixture<MemberAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberAddEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
