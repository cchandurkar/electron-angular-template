/// <reference types="@angular/localize" />
/// <reference path="../../main/src/preload/types/index.d.ts" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
