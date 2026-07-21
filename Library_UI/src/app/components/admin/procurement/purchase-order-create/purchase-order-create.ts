import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-purchase-order-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './purchase-order-create.html',
  styleUrl: './purchase-order-create.css'
})
export class PurchaseOrderCreateComponent implements OnInit {
  // Dropdown data
  suppliers: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];
  filteredSubCategories: any[] = [];
  books: any[] = [];
  allBooksMaster: any[] = [];
  editions: any[] = [];
  filteredEditions: any[] = [];

  // Cascading selections
  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;
  selectedBookId: number | null = null;
  selectedEditionId: number | null = null;

  additionalCosts: { description: string; amount: number | null }[] = [
    { description: '', amount: null }
  ];

  get additionalCostsTotal(): number {
    return this.additionalCosts.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  get grandTotal(): number {
    return this.orderTotal + this.additionalCostsTotal;
  }

  // Book dropdown
  bookSearchTerm = '';
  filteredBookOptions: any[] = [];
  showBookDropdown = false;
  selectedBook: any = null;
  @ViewChild('inlineSearchInput', { static: false }) inlineSearchInput?: ElementRef<HTMLInputElement>;

  // Inline book search
  inlineSearchTerm = '';
  inlineSearchResults: any[] = [];
  showInlineResults = false;

  selectedSupplier: any = null;

  // Header fields
  order = {
    supplierId: null as number | null,
    orderDate: new Date().toISOString().substring(0, 10),
    receiveDate: '',
    deliveryAddress: '',
    notes: ''
  };

  // Line items
  items: {
    bookEditionId: number;
    bookTitle: string;
    edition: string;
    authorNames: string;
    quantity: number;
    unitCost: number | null;
    unit: string;
  }[] = [];

  submitting = false;
  error = '';
  success = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const defaultReceiveDate = new Date();
    defaultReceiveDate.setDate(defaultReceiveDate.getDate() + 7);
    this.order.receiveDate = defaultReceiveDate.toISOString().substring(0, 10);

    this.adminService.getSuppliers().subscribe({
      next: (d: any) => { this.suppliers = d; this.cdr.markForCheck(); },
      error: () => { this.error = 'Failed to load suppliers.'; this.cdr.markForCheck(); }
    });

    this.adminService.getItemCategories().subscribe({
      next: (d: any) => { this.categories = d; this.cdr.markForCheck(); },
      error: () => { this.error = 'Failed to load categories.'; this.cdr.markForCheck(); }
    });

    this.adminService.getSubCategories().subscribe({
      next: (d: any) => {
        this.subCategories = d;
        this.filteredSubCategories = d;
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load sub-categories.'; this.cdr.markForCheck(); }
    });

    this.loadAllBooks();

    this.adminService.getBookEditions().subscribe({
      next: (d: any) => {
        this.editions = d;
        this.filteredEditions = d;
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load book editions.'; this.cdr.markForCheck(); }
    });
  }

  loadAllBooks() {
    this.adminService.getBooks().subscribe({
      next: (d: any) => {
        this.books = d;
        this.allBooksMaster = [...d];
        this.filteredBooksByCategory();
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load books.'; this.cdr.markForCheck(); }
    });
  }

  onSupplierChange() {
    this.selectedSupplier = this.suppliers.find(s => s.supplierId == this.order.supplierId) || null;
    this.cdr.markForCheck();
  }

  onCategoryChange() {
    this.filteredSubCategories = this.selectedCategoryId
      ? this.subCategories.filter(s => s.categoryId == this.selectedCategoryId)
      : this.subCategories;
    this.selectedSubCategoryId = null;
    this.resetBookSelections();
    this.filteredBooksByCategory();
  }

  onSubCategoryChange() {
    this.resetBookSelections();
    this.filteredBooksByCategory();
  }

  filteredBooksByCategory() {
    let filtered = [...this.allBooksMaster];
    if (this.selectedCategoryId) {
      filtered = filtered.filter(b => b.itemCategoryId == this.selectedCategoryId);
    }
    if (this.selectedSubCategoryId) {
      filtered = filtered.filter(b => b.subCategoryId == this.selectedSubCategoryId);
    }
    this.books = filtered;
    if (this.showBookDropdown) {
      this.filterBookOptions();
    }
  }

  resetBookSelections() {
    this.selectedBookId = null;
    this.selectedBook = null;
    this.bookSearchTerm = '';
    this.filteredBookOptions = [];
    this.showBookDropdown = false;
    this.filteredEditions = [];
    this.selectedEditionId = null;
  }

  toggleBookDropdown() {
    this.showBookDropdown = !this.showBookDropdown;
    if (this.showBookDropdown) {
      this.filterBookOptions();
    }
  }

  filterBookOptions() {
    const searchTerm = this.bookSearchTerm.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredBookOptions = this.books.slice(0, 20);
    } else {
      this.filteredBookOptions = this.books
        .filter(book =>
          book.title?.toLowerCase().includes(searchTerm) ||
          book.masterISBN?.toLowerCase().includes(searchTerm) ||
          book.language?.toLowerCase().includes(searchTerm)
        )
        .slice(0, 20);
    }
    this.cdr.markForCheck();
  }

  searchBooks() {
    this.filterBookOptions();
  }

  selectBook(book: any) {
    this.selectedBook = book;
    this.selectedBookId = book.bookId;
    this.bookSearchTerm = book.title;
    this.showBookDropdown = false;

    if (book.itemCategoryId) {
      this.selectedCategoryId = book.itemCategoryId;
      this.filteredSubCategories = this.subCategories.filter(s => s.categoryId == this.selectedCategoryId);
      this.selectedSubCategoryId = book.subCategoryId || null;
    }

    this.filteredEditions = this.editions.filter(e => e.bookId == book.bookId);
    this.selectedEditionId = null;
    this.cdr.markForCheck();
  }

  hideBookDropdown() {
    setTimeout(() => {
      this.showBookDropdown = false;
      this.cdr.markForCheck();
    }, 200);
  }

  onInlineSearchFocus() {
    if (this.inlineSearchTerm.trim()) {
      this.showInlineResults = true;
    }
  }

  onInlineSearch() {
    const term = this.inlineSearchTerm.toLowerCase().trim();
    if (!term) {
      this.inlineSearchResults = [];
      this.showInlineResults = false;
      return;
    }
    this.inlineSearchResults = this.allBooksMaster.filter(book =>
      book.title?.toLowerCase().includes(term) ||
      book.masterISBN?.toLowerCase().includes(term) ||
      book.language?.toLowerCase().includes(term) ||
      (book.authors && book.authors.some((a: any) =>
        a.fullName?.toLowerCase().includes(term)
      )) ||
      book.itemCategoryName?.toLowerCase().includes(term) ||
      book.subCategoryName?.toLowerCase().includes(term)
    ).slice(0, 30);
    this.showInlineResults = true;
    this.cdr.markForCheck();
  }

  selectBookFromInlineSearch(book: any) {
    this.inlineSearchTerm = book.title;
    this.showInlineResults = false;
    this.selectBook(book);
  }

  focusInlineSearch() {
    this.showInlineResults = true;
    setTimeout(() => {
      this.inlineSearchInput?.nativeElement.focus();
    }, 50);
  }

  addAdditionalCostRow() {
    this.additionalCosts.push({ description: '', amount: null });
  }

  removeAdditionalCostRow(index: number) {
    if (this.additionalCosts.length <= 1) return;
    this.additionalCosts.splice(index, 1);
  }

  clearInlineSearch() {
    this.inlineSearchTerm = '';
    this.inlineSearchResults = [];
    this.showInlineResults = false;
    this.resetBookSelections();
    this.cdr.markForCheck();
  }

  hideInlineResults() {
    setTimeout(() => {
      this.showInlineResults = false;
      this.cdr.markForCheck();
    }, 200);
  }

  getAuthorNames(book: any): string {
    if (!book.authors || book.authors.length === 0) {
      return 'Unknown';
    }
    return book.authors.map((a: any) => a.fullName).join(', ');
  }

  addEdition() {
    if (!this.selectedEditionId) {
      this.error = 'Please select an edition first.';
      return;
    }

    const ed = this.filteredEditions.find(e => e.bookEditionId == this.selectedEditionId);
    if (!ed) {
      this.error = 'Selected edition not found.';
      return;
    }

    if (this.items.some(i => i.bookEditionId === ed.bookEditionId)) {
      this.error = 'This edition is already added to the order.';
      setTimeout(() => { this.error = ''; }, 3000);
      return;
    }

    const book = this.selectedBook || this.books.find(b => b.bookId == ed.bookId);
    const authorNames = this.getAuthorNames(book);

    this.items.push({
      bookEditionId: ed.bookEditionId,
      bookTitle: ed.bookTitle || book?.title || '',
      edition: ed.edition || '',
      authorNames: authorNames,
      quantity: 1,
      unitCost: ed.price ?? null,
      unit: 'pcs'
    });

    this.selectedEditionId = null;
    this.error = '';
    this.cdr.markForCheck();
  }

  removeItem(i: number) {
    this.items.splice(i, 1);
    this.cdr.markForCheck();
  }

  get totalQty(): number {
    return this.items.reduce((s, i) => s + (i.quantity || 0), 0);
  }

  get orderTotal(): number {
    return this.items.reduce((s, i) => s + ((i.quantity || 0) * (i.unitCost || 0)), 0);
  }

  validateForm(): boolean {
    if (!this.order.supplierId) {
      this.error = 'Supplier is required.';
      return false;
    }
    if (!this.order.receiveDate) {
      this.error = 'Expected receive date is required.';
      return false;
    }
    if (this.order.receiveDate < this.order.orderDate) {
      this.error = 'Receive date must be on or after order date.';
      return false;
    }
    if (!this.items.length) {
      this.error = 'Add at least one book edition.';
      return false;
    }
    const invalidItem = this.items.find(i => !i.quantity || i.quantity <= 0);
    if (invalidItem) {
      this.error = `"${invalidItem.bookTitle}" must have a quantity greater than 0.`;
      return false;
    }
    return true;
  }

  submit() {
    this.error = '';
    this.success = '';

    if (!this.validateForm()) {
      this.cdr.markForCheck();
      return;
    }

    this.submitting = true;

    const payload = {
      supplierId: +this.order.supplierId!,
      orderDate: this.order.orderDate,
      receiveDate: this.order.receiveDate,
      deliveryAddress: this.order.deliveryAddress || null,
      notes: this.order.notes || null,
      items: this.items.map(i => ({
        bookEditionId: i.bookEditionId,
        quantity: i.quantity,
        unitCost: i.unitCost
      })),
      additionalCharge: this.additionalCostsTotal
    };

    this.adminService.createPurchaseOrder(payload).subscribe({
      next: (d: any) => {
        this.success = `Purchase Order ${d.pO_Number || ''} created successfully!`;
        this.submitting = false;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/admin/purchase-orders']);
        }, 1500);
      },
      error: (err: any) => {
        this.error = err.error?.message || err.error?.title || 'Failed to create purchase order.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  cancel() {
    if (this.items.length > 0 || this.order.supplierId || this.order.notes) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/admin/purchase-orders']);
      }
    } else {
      this.router.navigate(['/admin/purchase-orders']);
    }
  }
}