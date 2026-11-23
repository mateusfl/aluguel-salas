import { Component, input } from '@angular/core';

@Component({
  selector: 'app-selo-situacao',
  template: `
    <span
      class="badge badge-soft badge-sm gap-1.5 font-medium whitespace-nowrap"
      [class.badge-success]="confirmada()"
      [class.badge-warning]="!confirmada()"
      [class.text-base-content]="!confirmada()"
    >
      <span
        aria-hidden="true"
        class="status status-xs"
        [class.status-success]="confirmada()"
        [class.status-warning]="!confirmada()"
      ></span>
      {{ confirmada() ? 'Confirmada' : 'Pendente' }}
    </span>
  `,
})
export class SeloSituacao {
  readonly confirmada = input.required<boolean>();
}
