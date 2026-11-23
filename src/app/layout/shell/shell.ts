import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReservaService } from '../../services/reserva.service';
import { BarraLateral } from '../barra-lateral/barra-lateral';
import { BarraTopo } from '../barra-topo/barra-topo';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, BarraLateral, BarraTopo],
  template: `
    <div class="drawer lg:drawer-open min-h-dvh">
      <input
        id="menu-principal"
        type="checkbox"
        class="drawer-toggle"
        aria-label="Abrir ou fechar menu"
        [checked]="menuAberto()"
        (change)="menuAberto.set($any($event.target).checked)"
      />
      <div class="drawer-content flex min-w-0 flex-col">
        <app-barra-topo idDoMenu="menu-principal" [usuario]="auth.usuario()" (sair)="auth.sair()" />
        <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <router-outlet />
        </main>
      </div>
      <div class="drawer-side z-40">
        <label for="menu-principal" aria-label="Fechar menu" class="drawer-overlay"></label>
        <app-barra-lateral [pendentes]="pendentes()" (navegou)="menuAberto.set(false)" />
      </div>
    </div>
  `,
})
export class Shell {
  protected readonly auth = inject(AuthService);
  private readonly reservas = inject(ReservaService);

  protected readonly menuAberto = signal(false);
  protected readonly pendentes = computed(() => this.reservas.pendentes().length);
}
