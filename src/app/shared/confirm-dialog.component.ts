import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../core/translate.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  selector: 'app-confirm-dialog',
  template: `
    <div class="dialog-backdrop" *ngIf="open" (click)="onCancel()">
      <div class="dialog-card" (click)="$event.stopPropagation()">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>

        <div class="dialog-actions">
          <button class="btn btn-secondary" type="button" (click)="onCancel()">{{ 'common.cancel' | translate }}</button>
          <button class="btn btn-danger" type="button" (click)="onConfirm()">{{ 'common.delete' | translate }}</button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() message = '';

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
