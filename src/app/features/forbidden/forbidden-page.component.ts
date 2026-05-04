import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>{{ 'pages.forbidden.title' | translate }}</h1>
        <p class="muted">{{ 'pages.forbidden.message' | translate }}</p>

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-primary" routerLink="/collection">{{ 'pages.forbidden.goToCollection' | translate }}</a>
        </div>
      </div>
    </div>
  `
})
export class ForbiddenPageComponent {}
