import { HttpErrorResponse } from '@angular/common/http';
import { FieldTree, TreeValidationResult } from '@angular/forms/signals';

export const API_URL = 'http://localhost:3333/api';

interface ErroApi {
  campo: string;
  mensagem: string;
}

/** Converte a resposta de erro da API em erros do Signal Forms, cada um no seu campo. */
export function errosDoServidor<T>(erro: unknown, campos: FieldTree<T>): TreeValidationResult {
  if (erro instanceof HttpErrorResponse && Array.isArray(erro.error?.erros)) {
    const arvore = campos as unknown as Record<string, FieldTree<unknown>>;
    return (erro.error.erros as ErroApi[]).map(({ campo, mensagem }) => ({
      kind: 'servidor',
      message: mensagem,
      fieldTree: arvore[campo],
    }));
  }
  return { kind: 'servidor', message: mensagemDeErro(erro) };
}

export function mensagemDeErro(erro: unknown) {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) return 'Não foi possível falar com a API. Ela está rodando?';
    if (typeof erro.error?.mensagem === 'string') return erro.error.mensagem as string;
  }
  return 'Algo deu errado. Tente novamente.';
}
