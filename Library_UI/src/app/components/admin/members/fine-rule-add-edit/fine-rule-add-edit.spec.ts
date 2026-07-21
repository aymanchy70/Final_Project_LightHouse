import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineRuleAddEdit } from './fine-rule-add-edit';

describe('FineRuleAddEdit', () => {
  let component: FineRuleAddEdit;
  let fixture: ComponentFixture<FineRuleAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineRuleAddEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(FineRuleAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
