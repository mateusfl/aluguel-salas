import { Component, inject } from '@angular/core';
import { AvisosService } from '../services/avisos.service';
import { Icone } from './icone';

@Component({
  selector: 'app-pilha-avisos',
  imports: [Icone],
  template: `
    <div class="toast toast-bottom toast-end z-50" aria-live="polite">
      @for (aviso of servico.avisos(); track aviso.id) {
        <div
          role="status"
          class="alert motion-safe:animate-subir max-w-sm whitespace-normal shadow-lg"
          [class.alert-success]="aviso.tipo === 'sucesso'"
          [class.alert-error]="aviso.tipo === 'erro'"
        >
          <app-icone [nome]="aviso.tipo === 'sucesso' ? 'check' : 'alerta'" />
          <span>{{ aviso.texto }}</span>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-square"
            aria-label="Dispensar aviso"
            (click)="servico.dispensar(aviso.id)"
          >
            <app-icone nome="fechar" />
          </button>
        </div>
      }
    </div>
  `,
})
export class PilhaAvisos {
  protected readonly servico = inject(AvisosService);
}
