import { Component, computed, input } from '@angular/core';

const ICONES = {
  alerta:
    'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  busca: 'M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  calendario:
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  check: 'M20 6 9 17l-5-5',
  direita: 'm9 18 6-6-6-6',
  editar: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z',
  esquerda: 'm15 18-6-6 6-6',
  fechar: 'M18 6 6 18M6 6l12 12',
  lixeira:
    'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6',
  lua: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  mais: 'M5 12h14M12 5v14',
  menu: 'M4 6h16M4 12h16M4 18h16',
  olho: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  onda: 'M2 8c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.6 5-1M2 14c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.6 5-1',
  painel: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  pessoas:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  relogio: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  sair: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  sala: 'M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M14 12h.01',
  sol: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  voltar: 'M19 12H5M12 19l-7-7 7-7',
} as const;

export type NomeIcone = keyof typeof ICONES;

@Component({
  selector: 'app-icone',
  host: { class: 'inline-flex shrink-0' },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class="size-[1.15em]"
    >
      <path [attr.d]="caminho()" />
    </svg>
  `,
})
export class Icone {
  readonly nome = input.required<NomeIcone>();
  protected readonly caminho = computed(() => ICONES[this.nome()]);
}
