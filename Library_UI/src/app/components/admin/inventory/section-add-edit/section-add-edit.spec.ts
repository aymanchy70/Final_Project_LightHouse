import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionAddEdit } from './section-add-edit';

describe('SectionAddEdit', () => {
  let component: SectionAddEdit;
  let fixture: ComponentFixture<SectionAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionAddEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionAddEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
