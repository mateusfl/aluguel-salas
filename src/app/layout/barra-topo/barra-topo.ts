import { Component, computed, inject, input, output } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { TemaService } from '../../services/tema.service';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-barra-topo',
  imports: [Icone],
  templateUrl: './barra-topo.html',
})
export class BarraTopo {
  readonly usuario = input.required<Usuario | null>();
  readonly idDoMenu = input.required<string>();
  readonly sair = output<void>();

  protected readonly tema = inject(TemaService);
  protected readonly iniciais = computed(() =>
    (this.usuario()?.nome ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join(''),
  );
}
