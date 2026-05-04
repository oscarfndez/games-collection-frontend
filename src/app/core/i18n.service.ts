import { APP_INITIALIZER, Injectable, Provider, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type SupportedLanguage = 'es' | 'en';

const STORAGE_KEY = 'gamesCollectionLanguage';
const DEFAULT_LANGUAGE: SupportedLanguage = 'es';
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['es', 'en'];

type TranslationDictionary = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly dictionary = signal<TranslationDictionary>({});
  readonly language = signal<SupportedLanguage>(this.getStoredLanguage());

  async init(): Promise<void> {
    await this.loadLanguage(this.language());
  }

  async setLanguage(language: SupportedLanguage): Promise<void> {
    if (language === this.language()) {
      return;
    }

    await this.loadLanguage(language);
    this.language.set(language);
    localStorage.setItem(STORAGE_KEY, language);
  }

  translate(key: string, params: Record<string, string | number | undefined> = {}): string {
    const value = this.resolveKey(key);
    const text = typeof value === 'string' ? value : key;

    return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
      return result.replaceAll(`{{${paramKey}}}`, String(paramValue ?? ''));
    }, text);
  }

  private async loadLanguage(language: SupportedLanguage): Promise<void> {
    const dictionary = await firstValueFrom(
      this.http.get<TranslationDictionary>(`assets/i18n/${language}.json`)
    );

    this.dictionary.set(dictionary);
  }

  private resolveKey(key: string): unknown {
    return key.split('.').reduce<unknown>((current, part) => {
      if (current && typeof current === 'object' && part in current) {
        return (current as Record<string, unknown>)[part];
      }

      return undefined;
    }, this.dictionary());
  }

  private getStoredLanguage(): SupportedLanguage {
    const storedLanguage = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    return storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)
      ? storedLanguage
      : DEFAULT_LANGUAGE;
  }
}

export function provideI18n(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [I18nService],
      useFactory: (i18nService: I18nService) => () => i18nService.init()
    }
  ];
}
