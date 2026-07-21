import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { GrnReportComponent } from './grn-report';
import { AdminService } from '../../../../services/admin';

describe('GrnReportComponent', () => {
  let component: GrnReportComponent;
  let fixture: ComponentFixture<GrnReportComponent>;

  const mockGrn = {
    grnId: 1,
    grnNumber: 'GRN-001',
    receivedDate: new Date().toISOString(),
    receivedBy: 'Test User',
    vehicleNumber: 'ABC-123',
    deliveryPersonName: 'John Doe',
    status: 'Approved',
    notes: 'Test notes',
    items: [
      { grnItemId: 1, pO_Number: 'PO-001', bookTitle: 'Test Book', edition: '1st', quantity: 10, acceptedQuantity: 9, shelfCode: 'A1', condition: 'Good' }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrnReportComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '1' } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: AdminService, useValue: { getGRN: () => of(mockGrn) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GrnReportComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load GRN data on init', () => {
    fixture.detectChanges();
    expect(component.grn).toEqual(mockGrn);
    expect(component.loading).toBeFalse();
  });

  it('should calculate totals correctly', () => {
    fixture.detectChanges();
    expect(component.totalQuantity).toBe(10);
    expect(component.totalAccepted).toBe(9);
    expect(component.totalRejected).toBe(1);
    expect(component.acceptanceRate).toBe(90);
  });
});
