import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // ── ItemCategory ──────────────────────────────────────────────
  getItemCategories()                          { return this.http.get<any[]>(`${this.apiUrl}/ItemCategory`); }
  getActiveItemCategories()                    { return this.http.get<any[]>(`${this.apiUrl}/ItemCategory/active`); }
  getItemCategory(id: number)                  { return this.http.get<any>(`${this.apiUrl}/ItemCategory/${id}`); }
  createItemCategory(m: any)                   { return this.http.post(`${this.apiUrl}/ItemCategory`, m); }
  updateItemCategory(id: number, m: any)       { return this.http.put(`${this.apiUrl}/ItemCategory/${id}`, m); }
  deleteItemCategory(id: number)               { return this.http.delete(`${this.apiUrl}/ItemCategory/${id}`); }

  // ── SubCategory ───────────────────────────────────────────────
  getSubCategories()                                       { return this.http.get<any[]>(`${this.apiUrl}/SubCategory`); }
  getActiveSubCategories()                                 { return this.http.get<any[]>(`${this.apiUrl}/SubCategory/active`); }
  getSubCategoriesByCategory(categoryId: number)           { return this.http.get<any[]>(`${this.apiUrl}/SubCategory/byCategory/${categoryId}`); }
  getSubCategory(id: number)                               { return this.http.get<any>(`${this.apiUrl}/SubCategory/${id}`); }
  createSubCategory(m: any)                                { return this.http.post(`${this.apiUrl}/SubCategory`, m); }
  updateSubCategory(id: number, m: any)                    { return this.http.put(`${this.apiUrl}/SubCategory/${id}`, m); }
  deleteSubCategory(id: number)                            { return this.http.delete(`${this.apiUrl}/SubCategory/${id}`); }

  // ── Publisher ─────────────────────────────────────────────────
  getPublishers()                              { return this.http.get<any[]>(`${this.apiUrl}/Publisher`); }
  getActivePublishers()                        { return this.http.get<any[]>(`${this.apiUrl}/Publisher/active`); }
  getPublisher(id: number)                     { return this.http.get<any>(`${this.apiUrl}/Publisher/${id}`); }
  createPublisher(m: any)                      { return this.http.post(`${this.apiUrl}/Publisher`, m); }
  updatePublisher(id: number, m: any)          { return this.http.put(`${this.apiUrl}/Publisher/${id}`, m); }
  deletePublisher(id: number)                  { return this.http.delete(`${this.apiUrl}/Publisher/${id}`); }

  // ── Author — [FromForm] so we use FormData ────────────────────
  getAuthors()                                 { return this.http.get<any[]>(`${this.apiUrl}/Author`); }
  getActiveAuthors()                           { return this.http.get<any[]>(`${this.apiUrl}/Author/active`); }
  getAuthor(id: number)                        { return this.http.get<any>(`${this.apiUrl}/Author/${id}`); }
  createAuthor(formData: FormData)             { return this.http.post(`${this.apiUrl}/Author`, formData); }
  updateAuthor(id: number, formData: FormData) { return this.http.put(`${this.apiUrl}/Author/${id}`, formData); }
  deleteAuthor(id: number)                     { return this.http.delete(`${this.apiUrl}/Author/${id}`); }

  // ── Book — [FromForm] so we use FormData ──────────────────────
  getBooks()                                   { return this.http.get<any[]>(`${this.apiUrl}/Book`); }
  getBook(id: number)                          { return this.http.get<any>(`${this.apiUrl}/Book/${id}`); }
  createBook(formData: FormData)               { return this.http.post(`${this.apiUrl}/Book`, formData); }
  updateBook(id: number, formData: FormData)   { return this.http.put(`${this.apiUrl}/Book/${id}`, formData); }
  deleteBook(id: number)                       { return this.http.delete(`${this.apiUrl}/Book/${id}`); }

  // ── BookEdition — [FromForm] so we use FormData ───────────────
  getBookEditions()                                        { return this.http.get<any[]>(`${this.apiUrl}/BookEdition`); }
  getBookEditionsByBook(bookId: number)                    { return this.http.get<any[]>(`${this.apiUrl}/BookEdition/byBook/${bookId}`); }
  getBookEdition(id: number)                               { return this.http.get<any>(`${this.apiUrl}/BookEdition/${id}`); }
  createBookEdition(formData: FormData)                    { return this.http.post(`${this.apiUrl}/BookEdition`, formData); }
  updateBookEdition(id: number, formData: FormData)        { return this.http.put(`${this.apiUrl}/BookEdition/${id}`, formData); }
  deleteBookEdition(id: number)                            { return this.http.delete(`${this.apiUrl}/BookEdition/${id}`); }
  uploadDigitalCopy(editionId: number, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/BookEdition/${editionId}/digitalcopy`, fd);
  }
  getDigitalCopy(editionId: number)                        { return this.http.get<any>(`${this.apiUrl}/BookEdition/${editionId}/digitalcopy`); }
  downloadDigitalCopy(editionId: number) {
    return this.http.get(`${this.apiUrl}/BookEdition/${editionId}/digitalcopy/download`, { responseType: 'blob' });
  }
  previewDigitalCopy(editionId: number) {
    return this.http.get(`${this.apiUrl}/BookEdition/${editionId}/digitalcopy/preview`, { responseType: 'blob' });
  }
  deleteDigitalCopy(editionId: number) {
    return this.http.delete(`${this.apiUrl}/BookEdition/${editionId}/digitalcopy`);
  }

  // ── PhysicalCopy ──────────────────────────────────────────────
  getPhysicalCopies()                                      { return this.http.get<any[]>(`${this.apiUrl}/PhysicalCopy`); }
  getPhysicalCopy(id: number)                              { return this.http.get<any>(`${this.apiUrl}/PhysicalCopy/${id}`); }
  getPhysicalCopiesByEdition(editionId: number)            { return this.http.get<any[]>(`${this.apiUrl}/PhysicalCopy/byEdition/${editionId}`); }
  createPhysicalCopy(dto: any)                             { return this.http.post<any>(`${this.apiUrl}/PhysicalCopy`, dto); }
  bulkShelve(dto: { copyIds: number[]; shelfId: number })  { return this.http.post<any>(`${this.apiUrl}/PhysicalCopy/shelve`, dto); }
  updatePhysicalCopy(id: number, dto: any)                 { return this.http.put(`${this.apiUrl}/PhysicalCopy/${id}`, dto); }
  deletePhysicalCopy(id: number)                           { return this.http.delete(`${this.apiUrl}/PhysicalCopy/${id}`); }

  // ── MembershipType ────────────────────────────────────────────
  getMembershipTypes()                         { return this.http.get<any[]>(`${this.apiUrl}/MembershipType`); }
  getMembershipType(id: number)                { return this.http.get<any>(`${this.apiUrl}/MembershipType/${id}`); }
  createMembershipType(m: any)                 { return this.http.post(`${this.apiUrl}/MembershipType`, m); }
  updateMembershipType(id: number, m: any)     { return this.http.put(`${this.apiUrl}/MembershipType/${id}`, m); }
  deleteMembershipType(id: number)             { return this.http.delete(`${this.apiUrl}/MembershipType/${id}`); }

  // ── FineRule ──────────────────────────────────────────────────
  getFineRules()                               { return this.http.get<any[]>(`${this.apiUrl}/FineRule`); }
  getFineRule(id: number)                      { return this.http.get<any>(`${this.apiUrl}/FineRule/${id}`); }
  createFineRule(m: any)                       { return this.http.post(`${this.apiUrl}/FineRule`, m); }
  updateFineRule(id: number, m: any)           { return this.http.put(`${this.apiUrl}/FineRule/${id}`, m); }
  deleteFineRule(id: number)                   { return this.http.delete(`${this.apiUrl}/FineRule/${id}`); }

  // ── Member — [FromForm] so we use FormData ────────────────────
  getMembers()                                 { return this.http.get<any[]>(`${this.apiUrl}/Member`); }
  getMember(id: number)                        { return this.http.get<any>(`${this.apiUrl}/Member/${id}`); }
  createMember(formData: FormData)             { return this.http.post(`${this.apiUrl}/Member`, formData); }
  updateMember(id: number, formData: FormData) { return this.http.put(`${this.apiUrl}/Member/${id}`, formData); }
  deleteMember(id: number)                     { return this.http.delete(`${this.apiUrl}/Member/${id}`); }
  approveMember(id: number)                    { return this.http.post(`${this.apiUrl}/Member/approve/${id}`, {}); }
  rejectMember(id: number)                     { return this.http.post(`${this.apiUrl}/Member/reject/${id}`, {}); }
  // FIX #5: block/unblock methods wired to existing API endpoints
  blockMember(id: number, reason: string)      { return this.http.post(`${this.apiUrl}/Member/block/${id}`, JSON.stringify(reason), { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }); }
  unblockMember(id: number)                    { return this.http.post(`${this.apiUrl}/Member/unblock/${id}`, {}); }

  // ── Payment ───────────────────────────────────────────────────
  getMemberPayments(memberId: number)          { return this.http.get<any[]>(`${this.apiUrl}/Payment/member/${memberId}`); }
  recordPayment(payload: any)                  { return this.http.post<any>(`${this.apiUrl}/Payment`, payload); }
  // Direct endpoints — avoid O(n) fan-out
  getAllPayments()                              { return this.http.get<any[]>(`${this.apiUrl}/Payment`); }
  getPayment(id: number)                       { return this.http.get<any>(`${this.apiUrl}/Payment/${id}`); }

  // ── Reservation ───────────────────────────────────────────────
  // FIX #4: corrected URL from /Reservation to /Reservation/all (matches API [HttpGet("all")] route)
  getAllReservations()                          { return this.http.get<any[]>(`${this.apiUrl}/Reservation/all`); }
  getMemberReservations(memberId: number)       { return this.http.get<any[]>(`${this.apiUrl}/Reservation/member/${memberId}`); }
  cancelReservation(id: number)                { return this.http.post<any>(`${this.apiUrl}/Reservation/cancel/${id}`, {}); }
  createReservation(payload: any)              { return this.http.post<any>(`${this.apiUrl}/Reservation/reserve`, payload); }

  // ── Dashboard ─────────────────────────────────────────────────
  getDashboardStats()                          { return this.http.get<any>(`${this.apiUrl}/Dashboard/admin-stats`); }

  // ── Roles & Permissions ───────────────────────────────────────
  getRoles()                                   { return this.http.get<any[]>(`${this.apiUrl}/Role`); }

  createRole(name: string) {
    return this.http.post(
      `${this.apiUrl}/Role`,
      JSON.stringify(name),
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  deleteRole(roleName: string) {
    return this.http.delete(`${this.apiUrl}/Role/${encodeURIComponent(roleName)}`);
  }

  addPermission(roleName: string, permission: string) {
    return this.http.post(
      `${this.apiUrl}/Role/${encodeURIComponent(roleName)}/permissions`,
      JSON.stringify(permission),
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  removePermission(roleName: string, permission: string) {
    // encodeURIComponent does NOT encode dots, so "Member.Delete" stays as
    // "Member.Delete" in the URL — Kestrel treats ".Delete" as a file extension → 404.
    // Fix: manually replace dots with %2E before sending.
    const safePermission = permission.replace(/\./g, '%2E');
    return this.http.delete(
      `${this.apiUrl}/Role/${encodeURIComponent(roleName)}/permissions/${safePermission}`
    );
  }

  // ── Users ─────────────────────────────────────────────────────
  getUsers()                                   { return this.http.get<any[]>(`${this.apiUrl}/Role/users`); }

  assignRoleToUser(userId: number, roleName: string) {
    return this.http.post(
      `${this.apiUrl}/Role/users/${userId}/roles`,
      JSON.stringify(roleName),
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  removeRoleFromUser(userId: number, roleName: string) {
    return this.http.delete(
      `${this.apiUrl}/Role/users/${userId}/roles/${encodeURIComponent(roleName)}`
    );
  }

  // ── Floor ─────────────────────────────────────────────────────
  getFloors()                                  { return this.http.get<any[]>(`${this.apiUrl}/Floor`); }
  getFloor(id: number)                         { return this.http.get<any>(`${this.apiUrl}/Floor/${id}`); }
  createFloor(data: any)                       { return this.http.post(`${this.apiUrl}/Floor`, data); }
  updateFloor(id: number, data: any)           { return this.http.put(`${this.apiUrl}/Floor/${id}`, data); }
  deleteFloor(id: number)                      { return this.http.delete(`${this.apiUrl}/Floor/${id}`); }
  getLocationTree()                            { return this.http.get<any[]>(`${this.apiUrl}/Floor/tree`); }

  // ── Section ───────────────────────────────────────────────────
  getSections()                                { return this.http.get<any[]>(`${this.apiUrl}/Section`); }
  getSection(id: number)                       { return this.http.get<any>(`${this.apiUrl}/Section/${id}`); }
  getSectionsByFloor(floorId: number)          { return this.http.get<any[]>(`${this.apiUrl}/Section/byFloor/${floorId}`); }
  createSection(data: any)                     { return this.http.post(`${this.apiUrl}/Section`, data); }
  updateSection(id: number, data: any)         { return this.http.put(`${this.apiUrl}/Section/${id}`, data); }
  deleteSection(id: number)                    { return this.http.delete(`${this.apiUrl}/Section/${id}`); }

  // ── Rack ──────────────────────────────────────────────────────
  getRacks()                                   { return this.http.get<any[]>(`${this.apiUrl}/Rack`); }
  getRack(id: number)                          { return this.http.get<any>(`${this.apiUrl}/Rack/${id}`); }
  getRacksBySection(sectionId: number)         { return this.http.get<any[]>(`${this.apiUrl}/Rack/bySection/${sectionId}`); }
  createRack(data: any)                        { return this.http.post(`${this.apiUrl}/Rack`, data); }
  updateRack(id: number, data: any)            { return this.http.put(`${this.apiUrl}/Rack/${id}`, data); }
  deleteRack(id: number)                       { return this.http.delete(`${this.apiUrl}/Rack/${id}`); }

  // ── Shelf ─────────────────────────────────────────────────────
  getShelves()                                 { return this.http.get<any[]>(`${this.apiUrl}/Shelf`); }
  getShelf(id: number)                         { return this.http.get<any>(`${this.apiUrl}/Shelf/${id}`); }
  getShelvesByRack(rackId: number)             { return this.http.get<any[]>(`${this.apiUrl}/Shelf/byRack/${rackId}`); }
  createShelf(data: any)                       { return this.http.post(`${this.apiUrl}/Shelf`, data); }
  updateShelf(id: number, data: any)           { return this.http.put(`${this.apiUrl}/Shelf/${id}`, data); }
  deleteShelf(id: number)                      { return this.http.delete(`${this.apiUrl}/Shelf/${id}`); }

  // ── Purchase Order ────────────────────────────────────────────
  getPurchaseOrders()                          { return this.http.get<any[]>(`${this.apiUrl}/PurchaseOrder`); }
  getPurchaseOrder(id: number)                 { return this.http.get<any>(`${this.apiUrl}/PurchaseOrder/${id}`); }
  createPurchaseOrder(m: any)                  { return this.http.post(`${this.apiUrl}/PurchaseOrder`, m); }
  approvePurchaseOrder(id: number)             { return this.http.post(`${this.apiUrl}/PurchaseOrder/${id}/approve`, {}); }
  receivePurchaseOrder(id: number, m: any)     { return this.http.post(`${this.apiUrl}/PurchaseOrder/${id}/receive`, m); }
  cancelPurchaseOrder(id: number)              { return this.http.delete(`${this.apiUrl}/PurchaseOrder/${id}`); }

  // ── Suppliers ─────────────────────────────────────────────────
  getSuppliers()                               { return this.http.get(`${this.apiUrl}/Supplier`); }
  getSupplier(id: number)                      { return this.http.get(`${this.apiUrl}/Supplier/${id}`); }
  createSupplier(d: any)                       { return this.http.post(`${this.apiUrl}/Supplier`, d); }
  updateSupplier(id: number, d: any)           { return this.http.put(`${this.apiUrl}/Supplier/${id}`, d); }
  deleteSupplier(id: number)                   { return this.http.delete(`${this.apiUrl}/Supplier/${id}`); }

  // ── GRN ───────────────────────────────────────────────────────
  getGRNs()                                    { return this.http.get<any[]>(`${this.apiUrl}/GRN`); }
  getGRN(id: number)                           { return this.http.get<any>(`${this.apiUrl}/GRN/${id}`); }
  createGRN(m: any)                            { return this.http.post(`${this.apiUrl}/GRN`, m); }
  inspectGRN(id: number, payload: any)         { return this.http.post(`${this.apiUrl}/GRN/${id}/inspect`, payload); }

  // ── Borrowing / Circulation ───────────────────────────────────
  getBorrowingPending()                                          { return this.http.get<any[]>(`${this.apiUrl}/Borrowing/pending`); }
  getMemberBorrowings(memberId: number)                          { return this.http.get<any[]>(`${this.apiUrl}/Borrowing/member/${memberId}`); }
  requestBorrowing(dto: any)                                     { return this.http.post<any>(`${this.apiUrl}/Borrowing/request`, dto); }
  approveBorrowing(id: number)                                   { return this.http.post<any>(`${this.apiUrl}/Borrowing/approve/${id}`, {}); }
  rejectBorrowing(id: number)                                    { return this.http.post(`${this.apiUrl}/Borrowing/reject/${id}`, {}); }
  returnBook(id: number, dto: any)                               { return this.http.post<any>(`${this.apiUrl}/Borrowing/return/${id}`, dto); }
  markLostOrDamaged(id: number, dto: any)                        { return this.http.post<any>(`${this.apiUrl}/Borrowing/lost/${id}`, dto); }
  updateOverdueStatuses()                                        { return this.http.post(`${this.apiUrl}/Borrowing/update-overdue`, {}); }
  pickupReserved(physicalCopyId: number, memberId: number)       { return this.http.post<any>(`${this.apiUrl}/Borrowing/pickup-reserved/${physicalCopyId}`, memberId); }

  // ── Dashboard / Statistics ────────────────────────────────────
  getMemberDashboardStats()                                      { return this.http.get<any>(`${this.apiUrl}/Dashboard/member-stats`); }
}