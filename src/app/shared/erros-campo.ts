import { Component, input, Signal } from '@angular/core';

interface EstadoComErros {
  touched: Signal<boolean>;
  invalid: Signal<boolean>;
  errors: Signal<readonly { kind: string; message?: string }[]>;
}

/** Mostra os erros de um campo do Signal Forms depois que o usuário passou por ele. */
@Component({
  selector: 'app-erros-campo',
  template: `
    @if (estado().touched() && estado().invalid()) {
      @for (erro of estado().errors(); track erro.kind) {
        <p class="text-error text-xs font-medium" role="alert">{{ erro.message }}</p>
      }
    }
  `,
})
export class ErrosCampo {
  readonly estado = input.required<EstadoComErros>();
}
