import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { LayoutComponent } from './components/shared/layout/layout';
import { authGuard } from './guards/auth-guard';
import { permissionGuard } from './guards/permission.guard';

// ==================== ADMIN CORE ====================
import { DashboardComponent } from './components/admin/admin-core/dashboard/dashboard';
import { RoleManagerComponent } from './components/admin/admin-core/role-manager/role-manager';

// ==================== INVENTORY ====================
import { ItemCategoryListComponent } from './components/admin/inventory/item-category-list/item-category-list';
import { ItemCategoryAddEditComponent } from './components/admin/inventory/item-category-add-edit/item-category-add-edit';
import { SubcategoryListComponent } from './components/admin/inventory/subcategory-list/subcategory-list';
import { SubcategoryAddEditComponent } from './components/admin/inventory/subcategory-add-edit/subcategory-add-edit';
import { LocationTreeComponent } from './components/admin/inventory/location-tree/location-tree';
import { FloorListComponent } from './components/admin/inventory/floor-list/floor-list';
import { FloorAddEditComponent } from './components/admin/inventory/floor-add-edit/floor-add-edit';
import { SectionListComponent } from './components/admin/inventory/section-list/section-list';
import { SectionAddEditComponent } from './components/admin/inventory/section-add-edit/section-add-edit';
import { RackListComponent } from './components/admin/inventory/rack-list/rack-list';
import { RackAddEditComponent } from './components/admin/inventory/rack-add-edit/rack-add-edit';
import { ShelfListComponent } from './components/admin/inventory/shelf-list/shelf-list';
import { ShelfAddEditComponent } from './components/admin/inventory/shelf-add-edit/shelf-add-edit';

// ==================== CATALOG ====================
import { AuthorListComponent } from './components/admin/catalog/author-list/author-list';
import { AuthorAddEditComponent } from './components/admin/catalog/author-add-edit/author-add-edit';
import { PublisherListComponent } from './components/admin/catalog/publisher-list/publisher-list';
import { PublisherAddEditComponent } from './components/admin/catalog/publisher-add-edit/publisher-add-edit';
import { BookListComponent } from './components/admin/catalog/book-list/book-list';
import { BookAddEditComponent } from './components/admin/catalog/book-add-edit/book-add-edit';
import { BookEditionListComponent } from './components/admin/catalog/book-edition-list/book-edition-list';
import { BookEditionAddEditComponent } from './components/admin/catalog/book-edition-add-edit/book-edition-add-edit';
import { PhysicalCopyListComponent } from './components/admin/catalog/physical-copy-list/physical-copy-list';
import { PhysicalCopyAddEditComponent } from './components/admin/catalog/physical-copy-add-edit/physical-copy-add-edit';
import { PhysicalCopyShelveComponent } from './components/admin/catalog/physical-copy-shelve/physical-copy-shelve';

// ==================== MEMBERS ====================
import { MembershipTypeListComponent } from './components/admin/members/membership-type-list/membership-type-list';
import { MembershipTypeAddEditComponent } from './components/admin/members/membership-type-add-edit/membership-type-add-edit';
import { FineRuleListComponent } from './components/admin/members/fine-rule-list/fine-rule-list';
import { FineRuleAddEditComponent } from './components/admin/members/fine-rule-add-edit/fine-rule-add-edit';
import { MemberListComponent } from './components/admin/members/member-list/member-list';
import { MemberAddEditComponent } from './components/admin/members/member-add-edit/member-add-edit';

// ==================== CIRCULATION ====================
import { BorrowingListComponent }    from './components/admin/circulation/borrowing-list/borrowing-list';
import { BorrowingDetailComponent }  from './components/admin/circulation/borrowing-detail/borrowing-detail';
import { BorrowingRequestComponent } from './components/admin/circulation/borrowing-request/borrowing-request';
import { PaymentListComponent }      from './components/admin/circulation/payment-list/payment-list';
import { PaymentDetailComponent }    from './components/admin/circulation/payment-detail/payment-detail';
import { PaymentAddComponent }       from './components/admin/circulation/payment-add/payment-add';
import { ReservationListComponent }   from './components/admin/circulation/reservation-list/reservation-list';
import { ReservationDetailComponent } from './components/admin/circulation/reservation-detail/reservation-detail';
import { ReservationAddComponent }    from './components/admin/circulation/reservation-add/reservation-add';

// ==================== PROCUREMENT ====================
import { SupplierListComponent } from './components/admin/procurement/supplier-list/supplier-list';
import { SupplierAddEditComponent } from './components/admin/procurement/supplier-add-edit/supplier-add-edit';
import { PurchaseOrderListComponent } from './components/admin/procurement/purchase-order-list/purchase-order-list';
import { PurchaseOrderCreateComponent } from './components/admin/procurement/purchase-order-create/purchase-order-create';
import { PurchaseOrderDetailComponent } from './components/admin/procurement/purchase-order-detail/purchase-order-detail';
import { PurchaseOrderReceiveComponent } from './components/admin/procurement/purchase-order-receive/purchase-order-receive';
import { GRNListComponent } from './components/admin/procurement/grn-list/grn-list';
import { GRNCreateComponent } from './components/admin/procurement/grn-create/grn-create';
import { GRNDetailComponent } from './components/admin/procurement/grn-detail/grn-detail';
import { GRNInspectComponent } from './components/admin/procurement/grn-inspect/grn-inspect';
import { GrnReportComponent } from './components/admin/procurement/grn-report/grn-report';
import { PoReportComponent } from './components/admin/procurement/po-report/po-report';
import { ReportsHubComponent } from './components/admin/reports/reports-hub/reports-hub';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      // ==================== REPORTS ====================
      { path: 'reports', component: ReportsHubComponent },

      // ==================== LOCATION ROUTES ====================
      {
        path: 'location',
        children: [
          { path: 'tree',                  component: LocationTreeComponent },
          { path: 'floors',                component: FloorListComponent },
          { path: 'floors/add',            component: FloorAddEditComponent },
          { path: 'floors/edit/:id',       component: FloorAddEditComponent },
          { path: 'floors/details/:id',    component: FloorAddEditComponent },
          { path: 'sections',              component: SectionListComponent },
          { path: 'sections/add',          component: SectionAddEditComponent },
          { path: 'sections/edit/:id',     component: SectionAddEditComponent },
          { path: 'sections/details/:id',  component: SectionAddEditComponent },
          { path: 'racks',                 component: RackListComponent },
          { path: 'racks/add',             component: RackAddEditComponent },
          { path: 'racks/edit/:id',        component: RackAddEditComponent },
          { path: 'racks/details/:id',     component: RackAddEditComponent },
          { path: 'shelves',               component: ShelfListComponent },
          { path: 'shelves/add',           component: ShelfAddEditComponent },
          { path: 'shelves/edit/:id',      component: ShelfAddEditComponent },
          { path: 'shelves/details/:id',   component: ShelfAddEditComponent },
          { path: '',                      redirectTo: 'tree', pathMatch: 'full' }
        ]
      },

      // ==================== INVENTORY ROUTES ====================
      { path: 'item-categories',              component: ItemCategoryListComponent },
      { path: 'item-categories/add',          component: ItemCategoryAddEditComponent },
      { path: 'item-categories/edit/:id',     component: ItemCategoryAddEditComponent },
      { path: 'item-categories/details/:id',  component: ItemCategoryAddEditComponent },

      { path: 'sub-categories',               component: SubcategoryListComponent },
      { path: 'sub-categories/add',           component: SubcategoryAddEditComponent },
      { path: 'sub-categories/edit/:id',      component: SubcategoryAddEditComponent },
      { path: 'sub-categories/details/:id',   component: SubcategoryAddEditComponent },

      // ==================== CATALOG ROUTES ====================
      { path: 'authors',               component: AuthorListComponent },
      { path: 'authors/add',           component: AuthorAddEditComponent },
      { path: 'authors/edit/:id',      component: AuthorAddEditComponent },
      { path: 'authors/details/:id',   component: AuthorAddEditComponent },

      { path: 'publishers',            component: PublisherListComponent },
      { path: 'publishers/add',        component: PublisherAddEditComponent },
      { path: 'publishers/edit/:id',   component: PublisherAddEditComponent },
      { path: 'publishers/details/:id', component: PublisherAddEditComponent },

      { path: 'books',                 component: BookListComponent },
      { path: 'books/add',             component: BookAddEditComponent },
      { path: 'books/edit/:id',        component: BookAddEditComponent },
      { path: 'books/details/:id',     component: BookAddEditComponent },

      { path: 'book-editions',             component: BookEditionListComponent },
      { path: 'book-editions/add',         component: BookEditionAddEditComponent },
      { path: 'book-editions/edit/:id',    component: BookEditionAddEditComponent },
      { path: 'book-editions/details/:id', component: BookEditionAddEditComponent },

      { path: 'physical-copies',              component: PhysicalCopyListComponent },
      { path: 'physical-copies/add',          component: PhysicalCopyAddEditComponent },
      { path: 'physical-copies/edit/:id',     component: PhysicalCopyAddEditComponent },
      { path: 'physical-copies/details/:id',  component: PhysicalCopyAddEditComponent },
      { path: 'physical-copies/shelve',       component: PhysicalCopyShelveComponent },

      // ==================== MEMBERS ROUTES ====================
      { path: 'membership-types',              component: MembershipTypeListComponent },
      { path: 'membership-types/add',          component: MembershipTypeAddEditComponent },
      { path: 'membership-types/edit/:id',     component: MembershipTypeAddEditComponent },
      { path: 'membership-types/details/:id',  component: MembershipTypeAddEditComponent },

      { path: 'fine-rules',            component: FineRuleListComponent },
      { path: 'fine-rules/add',        component: FineRuleAddEditComponent },
      { path: 'fine-rules/edit/:id',   component: FineRuleAddEditComponent },
      { path: 'fine-rules/details/:id', component: FineRuleAddEditComponent },

      { path: 'members',               component: MemberListComponent },
      { path: 'members/add',           component: MemberAddEditComponent },
      { path: 'members/edit/:id',      component: MemberAddEditComponent },
      { path: 'members/details/:id',   component: MemberAddEditComponent },

      // ==================== CIRCULATION ROUTES ====================
      { path: 'circulation',               component: BorrowingListComponent },
      { path: 'circulation/request',       component: BorrowingRequestComponent },
      { path: 'circulation/details/:id',   component: BorrowingDetailComponent },

      // ==================== PAYMENT ROUTES ====================
      { path: 'payments',              component: PaymentListComponent },
      { path: 'payments/add',          component: PaymentAddComponent },
      { path: 'payments/details/:id',  component: PaymentDetailComponent },

      // ==================== RESERVATION ROUTES ====================
      { path: 'reservations',              component: ReservationListComponent },
      { path: 'reservations/add',          component: ReservationAddComponent },
      { path: 'reservations/details/:id',  component: ReservationDetailComponent },

      // ==================== PROCUREMENT ROUTES ====================
      // NOTE: specific sub-paths must come BEFORE the generic /:id route
      { path: 'suppliers',                   component: SupplierListComponent },
      { path: 'suppliers/add',               component: SupplierAddEditComponent },
      { path: 'suppliers/edit/:id',          component: SupplierAddEditComponent },
      { path: 'suppliers/details/:id',       component: SupplierAddEditComponent },

      { path: 'purchase-orders',             component: PurchaseOrderListComponent },
      { path: 'purchase-orders/create',      component: PurchaseOrderCreateComponent },
      { path: 'purchase-orders/receive/:id', component: PurchaseOrderReceiveComponent },  // ← must be before /:id
      { path: 'purchase-orders/report/:id',  component: PoReportComponent },              // ← must be before /:id
      { path: 'purchase-orders/details/:id', component: PurchaseOrderDetailComponent },   // ← must be before /:id
      { path: 'purchase-orders/:id',         component: PurchaseOrderDetailComponent },

      // ==================== GRN ROUTES ====================
      { path: 'grn',              component: GRNListComponent },
      { path: 'grn/create',       component: GRNCreateComponent },
      { path: 'grn/inspect/:id',  component: GRNInspectComponent },
      { path: 'grn/inspect',      component: GRNInspectComponent },
      { path: 'grn/details/:id',  component: GRNDetailComponent },
      { path: 'grn/report/:id',   component: GrnReportComponent },

      // ==================== SYSTEM ROUTES ====================
      { path: 'role-manager', component: RoleManagerComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];