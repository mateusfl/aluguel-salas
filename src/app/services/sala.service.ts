import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Sala } from '../models/sala';
import { API_URL } from '../shared/api';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SalaService {
  private readonly auth = inject(AuthService);

  // Só busca com sessão ativa. Ao sair, a URL vira undefined e o recurso fica ocioso.
  private readonly recurso = httpResource<Sala[]>(() =>
    this.auth.autenticado() ? `${API_URL}/salas` : undefined,
  );

  readonly salas = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;
  readonly falhou = computed(() => this.recurso.error() !== undefined);

  porId(id: string) {
    return this.salas().find((sala) => sala.id === id);
  }

  recarregar() {
    this.recurso.reload();
  }
}
