import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameDto, GameService } from '../../../core/game.service';
import { PlatformDto, PlatformService } from '../../../core/platform.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>{{ isEditMode ? 'Modificar juego' : 'Dar de alta juego' }}</h1>
        <p class="muted">
          {{ isEditMode ? 'Actualiza los datos del juego existente.' : 'Introduce los datos del nuevo juego.' }}
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
            <label>Plataformas</label>
            <p class="muted" style="margin: 0 0 8px;">Selecciona una o varias plataformas para este juego.</p>
            <div *ngIf="loadingPlatforms" class="muted">Cargando plataformas...</div>
            <div *ngIf="!loadingPlatforms" style="display: grid; gap: 10px;">
              <label
                *ngFor="let platform of platforms"
                class="platform-option"
              >
                <input
                  type="checkbox"
                  [checked]="isPlatformSelected(platform.id)"
                  (change)="togglePlatform(platform.id)"
                />
                <span>{{ platform.name }}</span>
              </label>
            </div>
            <div *ngIf="platformSelectionError" class="status-error" style="margin-top: 8px;">
              Debes seleccionar al menos una plataforma.
            </div>
          </div>

            <div class="form-field">
               <label for="imageUrl">URL de imagen</label>
               <input id="imageUrl" type="text" formControlName="image_url" placeholder="https://..." />
            </div>

            <div class="card" style="padding: 12px; margin-top: 8px;">
              <img
                [src]="form.controls.image_url.value || defaultImage"
                (error)="onImageError($event)"
                alt="Vista previa de la imagen del juego"
                style="max-width: 260px; width: 100%; border-radius: 12px;"
              />
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
  `,
  styles: [`
    .platform-option {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      width: fit-content;
      max-width: 100%;
      font-weight: 500;
      line-height: 1.25;
      cursor: pointer;
    }

    .platform-option input {
      flex: 0 0 auto;
      margin: 0;
    }
  `]
})
export class GameFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gameService = inject(GameService);
  private readonly platformService = inject(PlatformService);

  loading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  private gameId: string | null = null;
  platforms: PlatformDto[] = [];
  loadingPlatforms = false;
  defaultImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';

readonly form = this.fb.nonNullable.group({
  name: ['', [Validators.required]],
  description: ['', [Validators.required]],
  platform_ids: [[] as string[]],
  image_url: ['']
});

  ngOnInit(): void {
    this.loadPlatforms();

    this.gameId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.gameId;

    if (this.gameId) {
      this.loadGame(this.gameId);
    }
  }

loadPlatforms(): void {
  this.loadingPlatforms = true;

  this.platformService.getAll(undefined, 'name', 'asc', 0, 1000).subscribe({
    next: (response) => {
      this.platforms = response.content;
      this.loadingPlatforms = false;
    },
    error: () => {
      this.errorMessage = 'No se pudieron cargar las plataformas.';
      this.loadingPlatforms = false;
    }
  });
}

  loadGame(id: string): void {
    this.loading = true;

    this.gameService.getById(id).subscribe({
      next: (game: GameDto) => {
          this.form.patchValue({
          name: game.name,
          description: game.description,
          platform_ids: game.platform_ids?.length ? game.platform_ids : game.platform_id ? [game.platform_id] : [],
          image_url: game.image_url ?? ''
       });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los datos del juego.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.controls.platform_ids.value.length === 0) {
      this.platformSelectionError = true;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.platformSelectionError = false;

    const payload = this.form.getRawValue();

    const request$ = this.isEditMode && this.gameId
      ? this.gameService.update(this.gameId, payload)
      : this.gameService.create(payload);

    request$.subscribe({
      next: (saved) => {
        this.loading = false;
        this.successMessage = this.isEditMode
          ? 'Juego actualizado correctamente.'
          : 'Juego creado correctamente.';
        this.router.navigate(['inventory', 'games', saved.id]);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo guardar el juego.';
      }
    });
  }

  goBack(): void {
    if (this.gameId) {
      this.router.navigate(['inventory', 'games', this.gameId]);
      return;
    }

    this.router.navigate(['inventory', 'games']);
  }


onImageError(event: Event): void {
  (event.target as HTMLImageElement).src = this.defaultImage;
}

platformSelectionError = false;

isPlatformSelected(platformId?: string): boolean {
  return !!platformId && this.form.controls.platform_ids.value.includes(platformId);
}

togglePlatform(platformId?: string): void {
  if (!platformId) {
    return;
  }

  const selectedPlatformIds = this.form.controls.platform_ids.value;
  const nextPlatformIds = selectedPlatformIds.includes(platformId)
    ? selectedPlatformIds.filter((id) => id !== platformId)
    : [...selectedPlatformIds, platformId];

  this.form.controls.platform_ids.setValue(nextPlatformIds);
  this.platformSelectionError = nextPlatformIds.length === 0;
}
}
