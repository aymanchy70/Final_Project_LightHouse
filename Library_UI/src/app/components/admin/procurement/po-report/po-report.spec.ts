import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { PoReportComponent } from './po-report';
import { AdminService } from '../../../../services/admin';

describe('PoReportComponent', () => {
  let component: PoReportComponent;
  let fixture: ComponentFixture<PoReportComponent>;

  const mockOrder = {
    purchaseOrderId: 1,
    pO_Number: 'PO-001',
    supplierName: 'Test Supplier',
    orderDate: new Date().toISOString(),
    receiveDate: new Date().toISOString(),
    status: 'Approved',
    items: [
      {
        purchaseOrderItemId: 1,
        bookTitle: 'Test Book',
        edition: '1st',
        orderedQuantity: 10,
        receivedQuantity: 6,
        remainingQuantity: 4,
        unitCost: 25.00
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoReportComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '1' } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: AdminService, useValue: { getPurchaseOrder: () => of(mockOrder) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PoReportComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load order data on init', () => {
    fixture.detectChanges();
    expect(component.order).toEqual(mockOrder);
    expect(component.loading).toBeFalse();
  });

  it('should calculate order totals correctly', () => {
    fixture.detectChanges();
    expect(component.totalOrdered).toBe(10);
    expect(component.totalReceived).toBe(6);
    expect(component.totalRemaining).toBe(4);
    expect(component.orderTotal).toBe(250);
    expect(component.fulfillmentRate).toBe(60);
  });

  it('should map status class correctly', () => {
    expect(component.statusClass('PendingApproval')).toBe('pending');
    expect(component.statusClass('Approved')).toBe('approved');
    expect(component.statusClass('PartiallyReceived')).toBe('partial');
    expect(component.statusClass('Completed')).toBe('completed');
    expect(component.statusClass('Cancelled')).toBe('cancelled');
  });
});
