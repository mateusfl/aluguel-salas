import { Component, inject, input, signal } from '@angular/core';
import { email, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { mensagemDeErro } from '../../shared/api';
import { ErrosCampo } from '../../shared/erros-campo';
import { Icone } from '../../shared/icone';

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, ErrosCampo, Icone],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Vem da query string (?voltar=/reservas) pelo withComponentInputBinding. */
  readonly voltar = input<string>();

  protected readonly credenciais = signal({ email: '', senha: '' });

  protected readonly formulario = form(
    this.credenciais,
    (campos) => {
      required(campos.email, { message: 'Informe seu e-mail.' });
      email(campos.email, { message: 'Este e-mail não parece válido.' });
      required(campos.senha, { message: 'Informe sua senha.' });
      minLength(campos.senha, 6, { message: 'A senha tem ao menos 6 caracteres.' });
    },
    {
      submission: {
        action: async () => {
          const { email, senha } = this.credenciais();
          try {
            await this.auth.entrar(email, senha);
          } catch (erro) {
            return { kind: 'credenciais', message: mensagemDeErro(erro) };
          }
          const destino = this.voltar();
          await this.router.navigateByUrl(destino?.startsWith('/') ? destino : '/painel');
          return undefined;
        },
      },
    },
  );

  protected preencherDemonstracao() {
    this.credenciais.set({ email: 'recepcao@casamare.example', senha: 'mare1234' });
  }
}
