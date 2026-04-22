import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-confirm-dialog',
  template: `
    <div class="dialog-backdrop" *ngIf="open" (click)="onCancel()">
      <div class="dialog-card" (click)="$event.stopPropagation()">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>

        <div class="dialog-actions">
          <button class="btn btn-secondary" type="button" (click)="onCancel()">Cancelar</button>
          <button class="btn btn-danger" type="button" (click)="onConfirm()">Confirmar</button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Seguro que deseas continuar?';

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}