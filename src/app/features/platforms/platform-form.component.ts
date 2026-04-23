import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformDto, PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>{{ isEditMode ? 'Modificar plataforma' : 'Dar de alta plataforma' }}</h1>
        <p class="muted">
          {{ isEditMode ? 'Actualiza los datos de la plataforma existente.' : 'Introduce los datos de la nueva plataforma.' }}
        </p>

        <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-field">
            <label for="name">Nombre</label>
            <input id="name" type="text" formControlName="name" />
          </div>

          <div class="form-field">
            <label for="description">Descripción</label>
            <textarea id="description" formControlName="description"></textarea>
          </div>

          <div class="form-field">
            <label for="imageUrl">URL de imagen</label>
            <input id="imageUrl" type="text" formControlName="image_url" placeholder="https://..." />
          </div>

          <div class="form-field">
            <label>Vista previa</label>
            <div style="margin-top: 8px;">
              <img
                [src]="form.controls.image_url.value || defaultImage"
                (error)="onImageError($event)"
                alt="Vista previa de la imagen de la plataforma"
                style="max-width: 260px; width: 100%; border-radius: 12px; border: 1px solid #d0d7e2;"
              />
            </div>
          </div>

          <div *ngIf="errorMessage" class="status-error">{{ errorMessage }}</div>
          <div *ngIf="successMessage" class="status-success">{{ successMessage }}</div>

          <div class="actions">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
            <button class="btn btn-secondary" type="button" (click)="goBack()">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PlatformFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformService = inject(PlatformService);

  defaultImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';

  loading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  private platformId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    image_url: ['']
  });

  ngOnInit(): void {
    this.platformId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.platformId;

    if (this.platformId) {
      this.loadPlatform(this.platformId);
    }
  }

  loadPlatform(id: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.platformService.getById(id).subscribe({
      next: (platform: PlatformDto) => {
        this.form.patchValue({
          name: platform.name,
          description: platform.description,
          image_url: platform.image_url ?? ''
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los datos de la plataforma.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: PlatformDto = this.form.getRawValue();

    const request$ = this.isEditMode && this.platformId
      ? this.platformService.update(this.platformId, payload)
      : this.platformService.create(payload);

    request$.subscribe({
      next: (saved) => {
        this.loading = false;
        this.successMessage = this.isEditMode
          ? 'Plataforma actualizada correctamente.'
          : 'Plataforma creada correctamente.';

        this.router.navigate(['/platforms', saved.id]);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo guardar la plataforma.';
      }
    });
  }

  goBack(): void {
    if (this.platformId) {
      this.router.navigate(['/platforms', this.platformId]);
      return;
    }

    this.router.navigate(['/platforms']);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}