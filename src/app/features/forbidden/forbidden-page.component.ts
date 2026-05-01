import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>Sin privilegios suficientes</h1>
        <p class="muted">
          Tu usuario no tiene permisos para acceder a esta sección. Si necesitas entrar aquí,
          inicia sesión con un usuario administrador.
        </p>

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-primary" routerLink="/collection">Ir a mi colección</a>
        </div>
      </div>
    </div>
  `
})
export class ForbiddenPageComponent {}
