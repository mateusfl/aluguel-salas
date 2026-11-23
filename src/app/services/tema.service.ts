import { computed, effect, Injectable, signal } from '@angular/core';

type Tema = 'mare' | 'mare-noite';
const CHAVE = 'casa-mare.tema';

function temaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE);
  if (salvo === 'mare' || salvo === 'mare-noite') return salvo;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'mare-noite' : 'mare';
}

@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly tema = signal<Tema>(temaInicial());
  readonly escuro = computed(() => this.tema() === 'mare-noite');

  constructor() {
    effect(() => {
      document.documentElement.dataset['theme'] = this.tema();
      localStorage.setItem(CHAVE, this.tema());
    });
  }

  alternar() {
    this.tema.update((tema) => (tema === 'mare' ? 'mare-noite' : 'mare'));
  }
}
