import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineRuleList } from './fine-rule-list';

describe('FineRuleList', () => {
  let component: FineRuleList;
  let fixture: ComponentFixture<FineRuleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineRuleList],
    }).compileComponents();

    fixture = TestBed.createComponent(FineRuleList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
