import { Component, effect, ElementRef, input, model, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-dialogo-confirmacao',
  template: `
    <dialog #dialogo class="modal modal-bottom sm:modal-middle" (close)="aberto.set(false)">
      <div class="modal-box">
        <h3 class="font-display text-xl">{{ titulo() }}</h3>
        <div class="text-base-content/75 py-3 text-sm"><ng-content /></div>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" (click)="aberto.set(false)">Voltar</button>
          <button
            type="button"
            class="btn btn-error"
            [disabled]="ocupado()"
            (click)="confirmado.emit()"
          >
            @if (ocupado()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            {{ rotulo() }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button aria-label="Fechar">fechar</button>
      </form>
    </dialog>
  `,
})
export class DialogoConfirmacao {
  readonly aberto = model(false);
  readonly titulo = input.required<string>();
  readonly rotulo = input('Confirmar');
  readonly ocupado = input(false);
  readonly confirmado = output<void>();

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    effect(() => {
      const elemento = this.dialogo().nativeElement;
      if (this.aberto() && !elemento.open) elemento.showModal();
      if (!this.aberto() && elemento.open) elemento.close();
    });
  }
}
