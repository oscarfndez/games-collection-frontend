import { Component } from '@angular/core';
import { NotImplementedComponent } from '../../shared/not-implemented.component';

@Component({
  standalone: true,
  imports: [NotImplementedComponent],
  template: `<app-not-implemented title="Perfil"></app-not-implemented>`
})
export class ProfilePageComponent {}