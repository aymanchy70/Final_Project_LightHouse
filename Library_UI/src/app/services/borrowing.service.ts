import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface BorrowingResponse {
  borrowingId: number;
  memberId: number;
  memberName: string | null;
  physicalCopyId: number;
  bookTitle: string | null;
  barcode: string | null;
  requestedDate: string;
  issueDate: string | null;
  dueDate: string | null;
  returnDate: string | null;
  status: string;
  fineAmount: number | null;
  finePaid: boolean;
}

export interface IssueBookRequest {
  memberId: number;
  physicalCopyId: number;
}

export interface ReturnBookDto {
  notes?: string;
}

export interface LostBookDto {
  lossType: 'Lost' | 'Damaged';
  lossReason?: string;
}

@Injectable({ providedIn: 'root' })
export class BorrowingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /api/Borrowing/pending
  getPendingRequests() {
    return this.http.get<BorrowingResponse[]>(`${this.apiUrl}/Borrowing/pending`);
  }

  // GET /api/Borrowing/all-active
  getAllActiveBorrowings() {
    return this.http.get<BorrowingResponse[]>(`${this.apiUrl}/Borrowing/all-active`);
  }

  // GET /api/Borrowing/{id}
  getBorrowingById(id: number) {
    return this.http.get<BorrowingResponse>(`${this.apiUrl}/Borrowing/${id}`);
  }

  // GET /api/Borrowing/member/{memberId}
  getMemberBorrowings(memberId: number) {
    return this.http.get<BorrowingResponse[]>(`${this.apiUrl}/Borrowing/member/${memberId}`);
  }

  // POST /api/Borrowing/request
  requestBook(dto: IssueBookRequest) {
    return this.http.post<BorrowingResponse>(`${this.apiUrl}/Borrowing/request`, dto);
  }

  // POST /api/Borrowing/approve/{id}
  approveBorrowing(id: number) {
    return this.http.post<BorrowingResponse>(`${this.apiUrl}/Borrowing/approve/${id}`, {});
  }

  // POST /api/Borrowing/reject/{id}
  rejectBorrowing(id: number) {
    return this.http.post(`${this.apiUrl}/Borrowing/reject/${id}`, {});
  }

  // POST /api/Borrowing/return/{id}
  returnBook(id: number, dto: ReturnBookDto) {
    return this.http.post<BorrowingResponse>(`${this.apiUrl}/Borrowing/return/${id}`, dto);
  }

  // POST /api/Borrowing/lost/{id}
  markLostOrDamaged(id: number, dto: LostBookDto) {
    return this.http.post<BorrowingResponse>(`${this.apiUrl}/Borrowing/lost/${id}`, dto);
  }

  // POST /api/Borrowing/update-overdue
  updateOverdue() {
    return this.http.post(`${this.apiUrl}/Borrowing/update-overdue`, {});
  }

  // POST /api/Borrowing/pickup-reserved/{physicalCopyId}
  pickupReserved(physicalCopyId: number, memberId: number) {
    return this.http.post<BorrowingResponse>(
      `${this.apiUrl}/Borrowing/pickup-reserved/${physicalCopyId}`,
      memberId
    );
  }
}