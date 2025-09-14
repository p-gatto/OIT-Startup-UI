// 1. Creiamo il servizio per caricare la configurazione (approach moderno Angular 19)
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { AppConfig } from './config.model';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    private http = inject(HttpClient);
    private configPath = './assets/config/config.development.json';

    // Usa signals per una gestione più moderna dello stato
    private configSignal = signal<AppConfig | null>(null);
    private loadingSignal = signal<boolean>(false);
    private errorSignal = signal<string | null>(null);

    // BehaviorSubject per Observable reattivo - AGGIUNTO
    private configSubject = new BehaviorSubject<AppConfig | null>(null);

    // Getters pubblici per i signals (readonly)
    public readonly config = this.configSignal.asReadonly();
    public readonly loading = this.loadingSignal.asReadonly();
    public readonly error = this.errorSignal.asReadonly();
    /* 
        // Observable per compatibilità con il codice esistente
        public get config$(): Observable<AppConfig | null> {
            // Converti il signal in observable se necessario
            return new Observable(observer => {
                const unsubscribe = () => { };
                observer.next(this.configSignal());
                return unsubscribe;
            });
        } */

    // Observable reattivo per compatibilità - CORRETTO
    public readonly config$: Observable<AppConfig | null> = this.configSubject.asObservable();

    constructor() {
        if (environment.production === true) {
            this.configPath = './assets/config/config.production.json';
        }
        console.log('🔧 ConfigService initialized, config path:', this.configPath);
    }

    // Metodo per caricare la configurazione (moderno con firstValueFrom)
    async loadConfig(): Promise<AppConfig> {
        if (this.configSignal()) {
            console.log('⚡ Config already loaded, returning cached version');
            return this.configSignal()!;
        }

        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        try {
            console.log('🔄 Loading config from:', this.configPath);

            const config = await firstValueFrom(
                this.http.get<AppConfig>(this.configPath)
            );

            console.log('✅ Config loaded successfully:', config);

            /* this.configSignal.set(config);
             */

            // Aggiorna sia il signal che il BehaviorSubject - AGGIUNTO
            this.configSignal.set(config);
            this.configSubject.next(config);

            this.loadingSignal.set(false);

            return config;

        } catch (error) {
            console.error('❌ Error loading configuration:', error);

            // Configurazione di fallback
            const fallbackConfig: AppConfig = {
                apiBaseUrl: 'https://localhost',
                appName: 'Fallback App Name (Config Load Failed)'
            };

            this.errorSignal.set(error instanceof Error ? error.message : 'Unknown error');

            /* this.configSignal.set(fallbackConfig);
            this.loadingSignal.set(false); */

            // Aggiorna sia il signal che il BehaviorSubject anche per fallback - AGGIUNTO
            this.configSignal.set(fallbackConfig);
            this.configSubject.next(fallbackConfig);

            this.loadingSignal.set(false);

            return fallbackConfig;
        }
    }

    // Metodo per accedere alla configurazione attuale
    getConfig(): AppConfig | null {
        return this.configSignal();
    }

    // Metodo per ricaricare la configurazione
    async reloadConfig(): Promise<AppConfig> {
        this.configSignal.set(null); // Reset del cache
        this.configSubject.next(null);
        return this.loadConfig();
    }
}