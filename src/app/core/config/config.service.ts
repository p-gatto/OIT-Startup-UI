// 1. Creiamo il servizio per caricare la configurazione (approach moderno Angular 19)
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, lastValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

import { AppConfig } from './config.model';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    private http = inject(HttpClient);
    private configPath = './assets/config/config.development.json';

    private config = new BehaviorSubject<AppConfig | null>(null);
    public config$ = this.config.asObservable();

    constructor() {
        if (environment.production == true) {
            this.configPath = './assets/config/config.production.json';
        }
    }

    // Metodo per caricare la configurazione
    async loadConfig(): Promise<AppConfig> {
        const config = await lastValueFrom(
            this.http.get<AppConfig>(this.configPath)
        );
        this.config.next(config);
        return config;
    }

    // Metodo per accedere alla configurazione
    getConfig(): AppConfig | null {
        return this.config.getValue();
    }
}
