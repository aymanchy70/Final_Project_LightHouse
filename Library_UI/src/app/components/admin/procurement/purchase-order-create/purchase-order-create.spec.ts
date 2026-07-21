import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  books: any[] = [];           // Books filtered by category/sub-category
  allBooksMaster: any[] = [];  // Master copy of all books for global search
  editions: any[] = [];
  filteredEditions: any[] = [];

  // Cascading selections
  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;
  selectedBookId: number | null = null;
  selectedEditionId: number | null = null;

  // Book dropdown
  bookSearchTerm = '';
  filteredBookOptions: any[] = [];
  showBookDropdown = false;
  selectedBook: any = null;

  // Global search modal
  showGlobalSearchModal = false;
  globalSearchTerm = '';
  globalSearchLoading = false;
  globalSearchResults: any[] = [];

  selectedSupplier: any = null;

  // Header fields
  order = {
    supplierId:      null as number | null,
    orderDate:       new Date().toISOString().substring(0, 10),
    receiveDate:     '',
    deliveryAddress: '',
    notes:           ''
  };

  // Line items
  items: {
    bookEditionId: number;
    bookTitle:     string;
    edition:       string;
    authorNames:   string;
    quantity:      number;
    unitCost:      number | null;
    unit:          string;
  }[] = [];

  submitting = false;
  error   = '';
  success = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Set default receive date to 7 days from now
    const defaultReceiveDate = new Date();
    defaultReceiveDate.setDate(defaultReceiveDate.getDate() + 7);
    this.order.receiveDate = defaultReceiveDate.toISOString().substring(0, 10);
    
    // Load dropdowns and master data
    this.adminService.getSuppliers().subscribe({
      next: (d: any) => { 
        this.suppliers = d; 
        this.cdr.markForCheck(); 
      },
      error: (err) => {
        console.error('Failed to load suppliers:', err);
        this.error = 'Failed to load suppliers.';
        this.cdr.markForCheck();
      }
    });
    
    this.adminService.getItemCategories().subscribe({
      next: (d: any) => { 
        this.categories = d; 
        this.cdr.markForCheck(); 
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.error = 'Failed to load categories.';
        this.cdr.markForCheck();
      }
    });
    
    this.adminService.getSubCategories().subscribe({
      next: (d: any) => {
        this.subCategories = d;
        this.filteredSubCategories = d;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load sub-categories:', err);
        this.error = 'Failed to load sub-categories.';
        this.cdr.markForCheck();
      }
    });
    
    // Load all books with their associated data
    this.loadAllBooks();
    
    this.adminService.getBookEditions().subscribe({
      next: (d: any) => {
        this.editions = d;
        this.filteredEditions = d;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load book editions:', err);
        this.error = 'Failed to load book editions.';
        this.cdr.markForCheck();
      }
    });
  }

  // Load all books with authors and category info
  loadAllBooks() {
    this.adminService.getBooks().subscribe({
      next: (d: any) => {
        this.books = d;
        this.allBooksMaster = [...d];
        this.filteredBooksByCategory();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load books:', err);
        this.error = 'Failed to load books.';
        this.cdr.markForCheck();
      }
    });
  }

  onSupplierChange() {
    this.selectedSupplier = this.suppliers.find(s => s.supplierId == this.order.supplierId) || null;
    this.cdr.markForCheck();
  }

  // ── Cascading filters ────────────────────────────────────
  onCategoryChange() {
    this.filteredSubCategories = this.selectedCategoryId
      ? this.subCategories.filter(s => s.categoryId == this.selectedCategoryId)
      : this.subCategories;
    this.selectedSubCategoryId = null;
    
    // Reset book-related selections when category changes
    this.resetBookSelections();
    
    // Filter books based on category
    this.filteredBooksByCategory();
  }

  onSubCategoryChange() {
    // Reset book selections when sub-category changes
    this.resetBookSelections();
    this.filteredBooksByCategory();
  }

  // Filter books based on selected category and sub-category
  filteredBooksByCategory() {
    let filtered = [...this.allBooksMaster];
    
    if (this.selectedCategoryId) {
      filtered = filtered.filter(b => b.itemCategoryId == this.selectedCategoryId);
    }
    
    if (this.selectedSubCategoryId) {
      filtered = filtered.filter(b => b.subCategoryId == this.selectedSubCategoryId);
    }
    
    this.books = filtered;
    
    // Update dropdown options if dropdown is open
    if (this.showBookDropdown) {
      this.filterBookOptions();
    }
  }

  // Reset book selections
  resetBookSelections() {
    this.selectedBookId = null;
    this.selectedBook = null;
    this.bookSearchTerm = '';
    this.filteredBookOptions = [];
    this.showBookDropdown = false;
    this.filteredEditions = [];
    this.selectedEditionId = null;
  }

  // ── Book Dropdown Methods ─────────────────────────────────
  
  // Toggle the book dropdown
  toggleBookDropdown() {
    this.showBookDropdown = !this.showBookDropdown;
    if (this.showBookDropdown) {
      this.filterBookOptions();
    }
  }

  // Filter book options based on search term
  filterBookOptions() {
    const searchTerm = this.bookSearchTerm.toLowerCase().trim();
    
    if (!searchTerm) {
      // Show all books filtered by category/sub-category
      this.filteredBookOptions = this.books.slice(0, 20);
    } else {
      // Search within filtered books
      this.filteredBookOptions = this.books
        .filter(book =>
          book.title?.toLowerCase().includes(searchTerm) ||
          book.masterISBN?.toLowerCase().includes(searchTerm) ||
          book.language?.toLowerCase().includes(searchTerm) ||
          (book.isbn && book.isbn.toLowerCase().includes(searchTerm))
        )
        .slice(0, 20);
    }
    this.cdr.markForCheck();
  }

  // Search books (called on input)
  searchBooks() {
    this.filterBookOptions();
  }

  // Select a book from dropdown
  selectBook(book: any) {
    this.selectedBook = book;
    this.selectedBookId = book.bookId;
    this.bookSearchTerm = book.title;
    this.showBookDropdown = false;
    
    // Auto-fill category and sub-category based on selected book
    if (book.itemCategoryId) {
      this.selectedCategoryId = book.itemCategoryId;
      
      // Update sub-categories based on selected category
      this.filteredSubCategories = this.subCategories.filter(s => s.categoryId == this.selectedCategoryId);
      
      // Set sub-category if available
      if (book.subCategoryId) {
        this.selectedSubCategoryId = book.subCategoryId;
      } else {
        this.selectedSubCategoryId = null;
      }
    }
    
    // Load editions for this book
    this.filteredEditions = this.editions.filter(e => e.bookId == book.bookId);
    this.selectedEditionId = null;
    
    this.cdr.markForCheck();
  }

  // Hide book dropdown
  hideBookDropdown() {
    setTimeout(() => {
      this.showBookDropdown = false;
      this.cdr.markForCheck();
    }, 200);
  }

  // ── Global Search Methods ─────────────────────────────────
  
  // Open global search modal
  openGlobalSearch() {
    this.showGlobalSearchModal = true;
    this.globalSearchTerm = '';
    this.globalSearchResults = [];
    this.globalSearchLoading = false;
    this.cdr.markForCheck();
  }

  // Close global search modal
  closeGlobalSearch() {
    this.showGlobalSearchModal = false;
    this.globalSearchTerm = '';
    this.globalSearchResults = [];
    this.globalSearchLoading = false;
    this.cdr.markForCheck();
  }

  // Perform global search across all books
  performGlobalSearch() {
    if (!this.globalSearchTerm.trim()) {
      this.globalSearchResults = [];
      return;
    }
    
    this.globalSearchLoading = true;
    const searchTerm = this.globalSearchTerm.toLowerCase().trim();
    
    // Search across all books in master list
    this.globalSearchResults = this.allBooksMaster.filter(book =>
      book.title?.toLowerCase().includes(searchTerm) ||
      book.masterISBN?.toLowerCase().includes(searchTerm) ||
      book.language?.toLowerCase().includes(searchTerm) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchTerm)) ||
      (book.authors && book.authors.some((a: any) => 
        a.fullName?.toLowerCase().includes(searchTerm)
      ))
    ).slice(0, 50);
    
    this.globalSearchLoading = false;
    this.cdr.markForCheck();
  }

  // Select book from global search results
  selectBookFromGlobalSearch(book: any) {
    this.selectBook(book);
    this.closeGlobalSearch();
  }

  // ── Edition Management ───────────────────────────────────
  
  // Add selected edition as a row to the order
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

    // Check if already added
    if (this.items.some(i => i.bookEditionId === ed.bookEditionId)) {
      this.error = 'This edition is already added to the order.';
      setTimeout(() => { this.error = ''; }, 3000);
      return;
    }

    const book = this.selectedBook || this.books.find(b => b.bookId == ed.bookId);
    const authorNames = book?.authors?.map((a: any) => a.fullName).join(', ') || 'N/A';

    this.items.push({
      bookEditionId: ed.bookEditionId,
      bookTitle:     ed.bookTitle || book?.title || '',
      edition:       ed.edition || '',
      authorNames:   authorNames,
      quantity:      1,
      unitCost:      ed.price ?? null,
      unit:          'pcs'
    });

    // Reset selection
    this.selectedEditionId = null;
    this.error = '';
    this.success = '';
    this.cdr.markForCheck();
  }

  // Remove item from order
  removeItem(i: number) { 
    this.items.splice(i, 1);
    this.cdr.markForCheck();
  }

  // ── Totals ──────────────────────────────────────────────
  get totalQty(): number { 
    return this.items.reduce((s, i) => s + (i.quantity || 0), 0); 
  }
  
  get orderTotal(): number { 
    return this.items.reduce((s, i) => s + ((i.quantity || 0) * (i.unitCost || 0)), 0); 
  }

  // ── Form Validation ─────────────────────────────────────
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

    // Validate all items have quantity > 0
    const invalidItem = this.items.find(i => !i.quantity || i.quantity <= 0);
    if (invalidItem) {
      this.error = `"${invalidItem.bookTitle}" must have a quantity greater than 0.`;
      return false;
    }

    // Validate unit cost is not negative
    const invalidCost = this.items.find(i => i.unitCost !== null && i.unitCost < 0);
    if (invalidCost) {
      this.error = `"${invalidCost.bookTitle}" cannot have a negative unit price.`;
      return false;
    }

    return true;
  }

  // ── Submit Purchase Order ───────────────────────────────
  submit() {
    this.error = ''; 
    this.success = '';
    
    if (!this.validateForm()) {
      this.cdr.markForCheck();
      return;
    }

    this.submitting = true;
    
    const payload = {
      supplierId:  +this.order.supplierId!,
      orderDate:   this.order.orderDate,
      receiveDate: this.order.receiveDate,
      deliveryAddress: this.order.deliveryAddress || null,
      notes:       this.order.notes || null,
      items: this.items.map(i => ({
        bookEditionId: i.bookEditionId,
        quantity:      i.quantity,
        unitCost:      i.unitCost
      }))
    };

    this.adminService.createPurchaseOrder(payload).subscribe({
      next: (d: any) => {
        this.success = `Purchase Order ${d.pO_Number || ''} created successfully!`;
        this.submitting = false;
        this.cdr.markForCheck();
        
        // Navigate back to purchase orders list after 1.5 seconds
        setTimeout(() => {
          this.router.navigate(['/admin/purchase-orders']);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Create purchase order error:', err);
        this.error = err.error?.message || err.error?.title || 'Failed to create purchase order. Please try again.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Cancel and Go Back ──────────────────────────────────
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