import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-author-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './author-add-edit.html',
  styleUrl: './author-add-edit.css'
})
export class AuthorAddEditComponent implements OnInit {
  authorId: number | null = null;
  viewOnly = false;

  author = {
    fullName: '',
    pseudonym: '',
    dateOfBirth: '',
    dateOfDeath: '',
    nationality: '',
    biography: '',
    photoUrl: '',
    email: '',
    photoFile: null as File | null
  };

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
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.authorId = +params['id'];
        this.loadAuthor();
      }
    });
  }

  loadAuthor() {
    this.loading = true;
    this.error = '';
    this.adminService.getAuthor(this.authorId!).subscribe({
      next: (data: any) => {
        this.author = {
          fullName:    data.fullName    || '',
          pseudonym:   data.pseudonym   || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '',
          dateOfDeath: data.dateOfDeath ? data.dateOfDeath.substring(0, 10) : '',
          nationality: data.nationality || '',
          biography:   data.biography   || '',
          photoUrl:    data.photoUrl    || '',
          email:       data.email       || '',
          photoFile:   null
        };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load author.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildFormData(payload: any): FormData {
    const fd = new FormData();
    Object.keys(payload).forEach(key => {
      const value = payload[key];
      if (value !== null && value !== undefined && value !== '') {
        fd.append(key, value);
      }
    });
    return fd;
  }

  onPhotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.author.photoFile = input.files[0];
    }
  }

  submit() {
    this.error = '';
    this.success = '';

    if (!this.author.fullName || !this.author.fullName.trim()) {
      this.error = 'Full Name is required.';
      return;
    }

    this.submitting = true;

    const payload = {
      fullName:    this.author.fullName.trim(),
      pseudonym:   this.author.pseudonym.trim()   || null,
      dateOfBirth: this.author.dateOfBirth ? this.author.dateOfBirth + 'T00:00:00' : null,
      dateOfDeath: this.author.dateOfDeath ? this.author.dateOfDeath + 'T00:00:00' : null,
      nationality: this.author.nationality.trim() || null,
      biography:   this.author.biography.trim()   || null,
      photoUrl:    this.author.photoUrl.trim()    || null,
      email:       this.author.email.trim()       || null
    };

    const formData = this.buildFormData(payload);

    // Append the photo file if selected
    if (this.author.photoFile) {
      formData.append('PhotoFile', this.author.photoFile);
    }

    const call = this.authorId
      ? this.adminService.updateAuthor(this.authorId, formData)
      : this.adminService.createAuthor(formData);

    call.subscribe({
      next: () => {
        this.success = this.authorId ? 'Author updated successfully!' : 'Author created successfully!';
        this.submitting = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/admin/authors']), 1500);
      },
      error: (err: any) => {
        let msg = 'Failed to save author.';
        if (err?.error?.errors) {
          msg = Object.values(err.error.errors).flat().join(', ');
        } else if (err?.error?.message) {
          msg = err.error.message;
        } else if (err?.error?.title) {
          msg = err.error.title;
        }
        this.error = msg;
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/authors']);
  }
}
