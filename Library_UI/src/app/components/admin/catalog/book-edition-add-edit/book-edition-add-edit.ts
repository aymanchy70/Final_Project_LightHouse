import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { SafePipe } from '../../../../pipes/safe.pipe';

@Component({
  selector: 'app-book-edition-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SafePipe],
  templateUrl: './book-edition-add-edit.html',
  styleUrl: './book-edition-add-edit.css'
})
export class BookEditionAddEditComponent implements OnInit {
  editionId: number | null = null;
  viewOnly = false;
  edition: any = {
    bookId: null,
    publisherId: null,
    edition: '',
    isbn: '',
    publicationYear: null,
    language: '',
    pageCount: null,
    hasSoftCopy: false,
    paperType: '',
    coverType: '',
    coverImageFile: null as File | null,
    price: null
  };
  books: any[] = [];
  publishers: any[] = [];
  digitalCopy: any = null;
  digitalFile: File | null = null;
  digitalUploading = false;
  digitalError = '';
  loading = false;
  submitting = false;
  error = '';
  success = '';

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
    this.adminService.getBooks().subscribe({ next: (d: any) => this.books = d, error: () => {} });
    this.adminService.getPublishers().subscribe({ next: (d: any) => this.publishers = d, error: () => {} });
    this.route.params.subscribe(params => {
      if (params['id']) { this.editionId = +params['id']; this.loadEdition(); }
    });
  }

  loadEdition() {
    this.loading = true;
    this.adminService.getBookEdition(this.editionId!).subscribe({
      next: (data: any) => {
        this.edition = {
          bookId: data.bookId || null,
          publisherId: data.publisherId || null,
          edition: data.edition || '',
          isbn: data.isbn || '',
          publicationYear: data.publicationYear || null,
          language: data.language || '',
          pageCount: data.pageCount || null,
          hasSoftCopy: data.hasSoftCopy ?? false,
          paperType: data.paperType || '',
          coverType: data.coverType || '',
          coverImageFile: null,
          price: data.price || null
        };
        this.loading = false;
        this.loadDigitalCopy();
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load edition.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadDigitalCopy() {
    if (!this.editionId) return;
    this.adminService.getDigitalCopy(this.editionId).subscribe({
      next: (d: any) => { this.digitalCopy = d; this.cdr.markForCheck(); },
      error: () => { this.digitalCopy = null; }
    });
  }

  onDigitalFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.digitalError = 'Only PDF files are allowed.';
        return;
      }
      this.digitalFile = file;
      this.digitalError = '';
    }
  }

  uploadDigitalCopy(editionId?: number) {
    const id = editionId ?? this.editionId;
    if (!id || !this.digitalFile) return;
    this.digitalUploading = true;
    this.digitalError = '';
    this.adminService.uploadDigitalCopy(id, this.digitalFile).subscribe({
      next: (d: any) => {
        this.digitalCopy = d;
        this.digitalFile = null;
        this.digitalUploading = false;
        this.success = 'Digital copy uploaded.';
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.digitalError = err?.error?.message || err?.error || 'Upload failed.';
        this.digitalUploading = false;
        this.cdr.markForCheck();
      }
    });
  }

  downloadDigitalCopy() {
    if (!this.editionId) return;
    this.adminService.downloadDigitalCopy(this.editionId).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edition-${this.editionId}-digital.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => { this.digitalError = 'Download failed.'; this.cdr.markForCheck(); }
    });
  }

  showPreview = false;
  previewUrl: string | null = null;

  previewDigitalCopy() {
    if (!this.editionId) return;
    this.adminService.previewDigitalCopy(this.editionId).subscribe({
      next: (blob: Blob) => {
        this.previewUrl = URL.createObjectURL(blob);
        this.showPreview = true;
        this.cdr.markForCheck();
      },
      error: () => { this.digitalError = 'Preview failed.'; }
    });
  }

  closePreview() {
    this.showPreview = false;
    if (this.previewUrl) { URL.revokeObjectURL(this.previewUrl); this.previewUrl = null; }
  }

  deleteDigitalCopy() {
    if (!this.editionId || !confirm('Delete digital copy permanently?')) return;
    this.adminService.deleteDigitalCopy(this.editionId).subscribe({
      next: () => {
        this.digitalCopy = null;
        this.digitalFile = null;
        this.digitalError = '';
        this.cdr.markForCheck();
      },
      error: () => { this.digitalError = 'Delete failed.'; }
    });
  }

  submit() {
    this.error = '';
    this.success = '';
    if (!this.edition.bookId) { this.error = 'Please select a book.'; return; }
    if (!this.edition.edition.trim()) { this.error = 'Edition is required (e.g. 1st, 2nd).'; return; }
    if (!this.edition.isbn.trim()) { this.error = 'ISBN is required.'; return; }
    this.submitting = true;

    const formData = new FormData();
    formData.append('bookId', this.edition.bookId.toString());
    formData.append('publisherId', this.edition.publisherId ? this.edition.publisherId.toString() : '');
    formData.append('edition', this.edition.edition.trim());
    formData.append('isbn', this.edition.isbn.trim());
    formData.append('publicationYear', this.edition.publicationYear ? this.edition.publicationYear.toString() : '');
    formData.append('language', this.edition.language || '');
    formData.append('pageCount', this.edition.pageCount ? this.edition.pageCount.toString() : '');
    formData.append('hasSoftCopy', this.edition.hasSoftCopy.toString());
    formData.append('paperType', this.edition.paperType || '');
    formData.append('coverType', this.edition.coverType || '');
    if (this.edition.coverImageFile) {
      formData.append('coverImageFile', this.edition.coverImageFile);
    }
    formData.append('price', this.edition.price ? this.edition.price.toString() : '');

    if (this.editionId) {
      // UPDATE
      this.adminService.updateBookEdition(this.editionId, formData).subscribe({
        next: () => {
          this.success = 'Updated!';
          this.submitting = false;
          setTimeout(() => this.router.navigate(['/admin/book-editions']), 1500);
        },
        error: (err: any) => {
          const msg = err.error?.errors
            ? Object.values(err.error.errors).flat().join(', ')
            : err.error?.title || err.error?.message || 'Failed to save edition.';
          this.error = '' + msg;
          this.submitting = false;
        }
      });
    } else {
      // CREATE — then auto-upload PDF if one was selected
      this.adminService.createBookEdition(formData).subscribe({
        next: (created: any) => {
          const newId = created?.bookEditionId;
          if (this.digitalFile && newId) {
            // Upload the PDF right after creation, then navigate
            this.adminService.uploadDigitalCopy(newId, this.digitalFile).subscribe({
              next: () => {
                this.success = 'Created with digital copy!';
                this.submitting = false;
                setTimeout(() => this.router.navigate(['/admin/book-editions']), 1500);
              },
              error: () => {
                // Edition was saved; only PDF upload failed — still navigate but warn
                this.success = 'Edition created, but PDF upload failed. You can retry from Edit.';
                this.submitting = false;
                setTimeout(() => this.router.navigate(['/admin/book-editions']), 2500);
              }
            });
          } else {
            this.success = 'Created!';
            this.submitting = false;
            setTimeout(() => this.router.navigate(['/admin/book-editions']), 1500);
          }
        },
        error: (err: any) => {
          const msg = err.error?.errors
            ? Object.values(err.error.errors).flat().join(', ')
            : err.error?.title || err.error?.message || 'Failed to save edition.';
          this.error = '' + msg;
          this.submitting = false;
        }
      });
    }
  }

  cancel() { this.router.navigate(['/admin/book-editions']); }

  onCoverImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) { this.edition.coverImageFile = file; }
  }
}