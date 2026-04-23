import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-not-implemented',
  template: `
    <main class="app-shell">
      <div class="app-panel">
        <div class="panel-content">
          <h1>{{ title }}</h1>
          <p class="muted">La funcionalidad aún no está implementada.</p>
        </div>
      </div>
    </main>
  `
})
export class NotImplementedComponent {
  @Input() title = 'Pantalla';
}