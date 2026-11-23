import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: false }),
    });
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('cria a aplicação com a área de rotas', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelector('router-outlet')).not.toBeNull();
  });
});
