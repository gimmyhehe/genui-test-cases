import { Routes } from '@angular/router';
import { demoRegistry, defaultDemoId } from './demo-registry';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: `demos/${defaultDemoId}` },
  ...demoRegistry.map((demo) => ({
    path: `demos/${demo.id}`,
    loadComponent: demo.load,
  })),
  { path: '**', redirectTo: `demos/${defaultDemoId}` },
];
