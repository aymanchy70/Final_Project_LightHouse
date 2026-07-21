import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GrnDraftService {

  // Raw GRN form payload ready to POST to API on approval
  private _payload: any = null;

  // Display data for the inspection page (book titles, editions, shelf names etc.)
  private _displayItems: {
    purchaseOrderItemId: number;
    bookTitle:  string;
    edition:    string;
    poNumber:   string;
    shelfId:    number;
    shelfCode:  string;
    receiveQty: number;
  }[] = [];

  // Header display info for the inspection banner
  private _grnHeader: {
    receivedDate:       string;
    receivedBy:         string;
    vehicleNumber:      string;
    deliveryPersonName: string;
    notes:              string;
    supplierName:       string;
    poNumber:           string;
  } | null = null;

  // ── Store draft (called from grn-create on Save) ─────────
  store(payload: any, displayItems: any[], header: any) {
    this._payload      = payload;
    this._displayItems = displayItems;
    this._grnHeader    = header;
  }

  // ── Read draft (called from grn-inspect on load) ─────────
  get payload()      { return this._payload; }
  get displayItems() { return this._displayItems; }
  get grnHeader()    { return this._grnHeader; }
  get hasDraft()     { return !!this._payload; }

  // ── Clear after submission or cancel ─────────────────────
  clear() {
    this._payload      = null;
    this._displayItems = [];
    this._grnHeader    = null;
  }
}