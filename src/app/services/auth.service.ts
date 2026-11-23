import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Sessao } from '../models/usuario';
import { API_URL } from '../shared/api';
import { AvisosService } from './avisos.service';

const CHAVE = 'casa-mare.sessao';

function tokenValido(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(base64)) as { exp: number };
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function lerSessao(): Sessao | null {
  try {
    const sessao = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as Sessao | null;
    return sessao && tokenValido(sessao.token) ? sessao : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly avisos = inject(AvisosService);
  private readonly sessao = signal<Sessao | null>(lerSessao());

  readonly usuario = computed(() => this.sessao()?.usuario ?? null);
  readonly token = computed(() => this.sessao()?.token ?? null);
  readonly autenticado = computed(() => this.sessao() !== null);

  async entrar(email: string, senha: string) {
    const sessao = await firstValueFrom(
      this.http.post<Sessao>(`${API_URL}/auth/login`, { email, senha }),
    );
    localStorage.setItem(CHAVE, JSON.stringify(sessao));
    this.sessao.set(sessao);
  }

  sair() {
    this.limpar();
    void this.router.navigateByUrl('/login');
  }

  /** Chamado pelo interceptor quando a API recusa o token. */
  expirar() {
    if (!this.autenticado()) return;
    const voltar = this.router.url;
    this.limpar();
    this.avisos.erro('Sua sessão expirou. Entre novamente.');
    void this.router.navigate(['/login'], { queryParams: { voltar } });
  }

  private limpar() {
    localStorage.removeItem(CHAVE);
    this.sessao.set(null);
  }
}
