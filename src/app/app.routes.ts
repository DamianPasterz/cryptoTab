import { Routes } from '@angular/router';

export enum RoutesPath {
  initial = '',
 dashboard = 'dashboard'
}

export const routes: Routes = [{
  path: RoutesPath.dashboard,
  loadComponent: () => import('./dashboard/dashboard.component').then((c) => c.DashboardComponent),
},
  {
    path: '**',
    redirectTo: RoutesPath.dashboard,

    
}];
