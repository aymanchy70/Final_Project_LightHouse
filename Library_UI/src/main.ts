import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.log('main.ts: Starting bootstrap...');

bootstrapApplication(App, appConfig)
  .then(() => console.log('Bootstrap successful'))
  .catch((err) => {
    console.error('Bootstrap error:', err);
    document.body.innerHTML = '<div style="padding: 20px; color: red;">Application failed to load: ' + err.message + '</div>';
  });
