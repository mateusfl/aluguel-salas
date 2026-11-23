import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icone, NomeIcone } from '../../shared/icone';

interface ItemMenu {
  rota: string;
  rotulo: string;
  icone: NomeIcone;
  exato: boolean;
}

@Component({
  selector: 'app-barra-lateral',
  imports: [RouterLink, RouterLinkActive, Icone],
  host: { class: 'block min-h-full' },
  templateUrl: './barra-lateral.html',
})
export class BarraLateral {
  readonly pendentes = input(0);
  readonly navegou = output<void>();

  protected readonly itens: ItemMenu[] = [
    { rota: '/painel', rotulo: 'Painel', icone: 'painel', exato: true },
    { rota: '/reservas', rotulo: 'Reservas', icone: 'calendario', exato: true },
    { rota: '/salas', rotulo: 'Salas', icone: 'sala', exato: true },
  ];
}
