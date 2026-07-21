import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-book-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './book-add-edit.html',
  styleUrl: './book-add-edit.css'
})
export class BookAddEditComponent implements OnInit {
  bookId: number | null = null;
  viewOnly = false;
  book: any = {
    title: '', subtitle: '', description: '', masterISBN: '', language: '',
    publicationYear: null, pageCount: null, coverImageUrl: '',
    isRareBook: false, requiresSecurityDeposit: false, securityDepositAmount: null,
    itemCategoryId: null, subCategoryId: null, publisherId: null,
    baseLibraryCode: '', ddcNumber: '', cutterNumber: '',
    authorIds: [] as number[],
    coverImageFile: null as File | null,
    pdfFile: null as File | null           // ← NEW
  };

  categories: any[] = []; subCategories: any[] = []; filteredSubCategories: any[] = [];
  publishers: any[] = []; authors: any[] = [];
  loading = false; submitting = false; error = ''; success = '';

  // ← NEW
  pdfError = '';

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.url.subscribe(urlSegments => {
      this.viewOnly = urlSegments.some(seg => seg.path === 'details');
    });
    this.loadDropdowns();
    this.route.params.subscribe(params => {
      if (params['id']) { this.bookId = +params['id']; this.loadBook(); }
    });
  }

  loadDropdowns() {
    this.adminService.getItemCategories().subscribe({ next: (d: any) => this.categories = d, error: () => {} });
    this.adminService.getSubCategories().subscribe({ next: (d: any) => { this.subCategories = d; this.filteredSubCategories = d; }, error: () => {} });
    this.adminService.getPublishers().subscribe({ next: (d: any) => this.publishers = d, error: () => {} });
    this.adminService.getAuthors().subscribe({ next: (d: any) => this.authors = d, error: () => {} });
  }

  onCategoryChange() {
    this.filteredSubCategories = this.book.itemCategoryId
      ? this.subCategories.filter((s: any) => s.categoryId == this.book.itemCategoryId)
      : this.subCategories;
    this.book.subCategoryId = null;
  }

  toggleAuthor(id: number) {
    const idx = this.book.authorIds.indexOf(id);
    if (idx > -1) this.book.authorIds.splice(idx, 1); else this.book.authorIds.push(id);
  }
  isAuthorSelected(id: number): boolean { return this.book.authorIds.includes(id); }

  onCoverImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.book.coverImageFile = input.files[0];
    }
  }

  // ← NEW: PDF file picker handler
  onPdfFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.pdfError = 'Only PDF files are allowed.';
      this.book.pdfFile = null;
      return;
    }
    this.pdfError = '';
    this.book.pdfFile = file;
  }

  loadBook() {
    this.loading = true;
    this.adminService.getBook(this.bookId!).subscribe({
      next: (data: any) => {
        this.book = {
          title: data.title || '', subtitle: data.subtitle || '', description: data.description || '',
          masterISBN: data.masterISBN || '', language: data.language || '',
          publicationYear: data.publicationYear || null, pageCount: data.pageCount || null,
          coverImageUrl: data.coverImageUrl || '', isRareBook: data.isRareBook || false,
          requiresSecurityDeposit: data.requiresSecurityDeposit || false,
          securityDepositAmount: data.securityDepositAmount || null,
          itemCategoryId: data.itemCategoryId || null, subCategoryId: data.subCategoryId || null,
          publisherId: data.publisherId || null,
          baseLibraryCode: data.baseLibraryCode || '',
          ddcNumber: data.ddcNumber || '',
          cutterNumber: data.cutterNumber || '',
          authorIds: data.authors ? data.authors.map((a: any) => a.authorId) : [],
          coverImageFile: null as File | null,
          pdfFile: null as File | null        // ← NEW
        };
        if (data.itemCategoryId)
          this.filteredSubCategories = this.subCategories.filter((s: any) => s.categoryId == data.itemCategoryId);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load book.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  submit() {
    this.error = ''; this.success = '';
    if (!this.book.title.trim()) { this.error = 'Title is required.'; return; }
    if (!this.book.baseLibraryCode.trim()) { this.error = 'Base Library Code is required (e.g. LIB, SCI).'; return; }
    if (!this.book.authorIds.length) { this.error = 'At least one author must be selected.'; return; }
    this.submitting = true;

    const formData = new FormData();
    formData.append('title', this.book.title.trim());
    if (this.book.subtitle) formData.append('subtitle', this.book.subtitle);
    if (this.book.description) formData.append('description', this.book.description);
    if (this.book.masterISBN) formData.append('masterISBN', this.book.masterISBN);
    if (this.book.language) formData.append('language', this.book.language);
    if (this.book.publicationYear) formData.append('publicationYear', this.book.publicationYear.toString());
    if (this.book.pageCount) formData.append('pageCount', this.book.pageCount.toString());
    if (this.book.coverImageUrl) formData.append('coverImageUrl', this.book.coverImageUrl);
    formData.append('isRareBook', this.book.isRareBook.toString());
    formData.append('requiresSecurityDeposit', this.book.requiresSecurityDeposit.toString());
    if (this.book.requiresSecurityDeposit && this.book.securityDepositAmount != null) {
      formData.append('securityDepositAmount', this.book.securityDepositAmount.toString());
    }
    if (this.book.itemCategoryId) formData.append('itemCategoryId', this.book.itemCategoryId.toString());
    if (this.book.subCategoryId) formData.append('subCategoryId', this.book.subCategoryId.toString());
    if (this.book.publisherId) formData.append('publisherId', this.book.publisherId.toString());
    formData.append('baseLibraryCode', this.book.baseLibraryCode.trim().toUpperCase());
    if (this.book.ddcNumber) formData.append('ddcNumber', this.book.ddcNumber);
    if (this.book.cutterNumber) formData.append('cutterNumber', this.book.cutterNumber);
    this.book.authorIds.forEach((id: number) => formData.append('authorIds', id.toString()));
    if (this.book.coverImageFile) formData.append('coverImageFile', this.book.coverImageFile);
    // NOTE: pdfFile is stored in book.pdfFile for the UI picker; it is NOT sent to
    // the Book API (which has no PDF endpoint). Wire it to your digital-copy upload
    // service after the book is created if needed, same pattern as book-edition.

    const request = this.bookId
      ? this.adminService.updateBook(this.bookId, formData)
      : this.adminService.createBook(formData);

    request.subscribe({
      next: () => {
        this.success = this.bookId ? 'Book updated!' : 'Book created!';
        this.submitting = false;
        setTimeout(() => this.router.navigate(['/admin/books']), 1500);
      },
      error: (err: any) => {
        const msg = err.error?.errors
          ? Object.values(err.error.errors).flat().join(', ')
          : err.error?.title || err.error?.message || 'Failed to save.';
        this.error = '' + msg;
        this.submitting = false;
      }
    });
  }

  cancel() { this.router.navigate(['/admin/books']); }
}