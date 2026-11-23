import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  tipo: 'sucesso' | 'erro';
  texto: string;
}

@Injectable({ providedIn: 'root' })
export class AvisosService {
  private proximoId = 1;
  private readonly lista = signal<Aviso[]>([]);

  readonly avisos = this.lista.asReadonly();

  sucesso(texto: string) {
    this.mostrar('sucesso', texto);
  }

  erro(texto: string) {
    this.mostrar('erro', texto);
  }

  dispensar(id: number) {
    this.lista.update((avisos) => avisos.filter((a) => a.id !== id));
  }

  private mostrar(tipo: Aviso['tipo'], texto: string) {
    const id = this.proximoId++;
    this.lista.update((avisos) => [...avisos, { id, tipo, texto }]);
    setTimeout(() => this.dispensar(id), 4000);
  }
}
