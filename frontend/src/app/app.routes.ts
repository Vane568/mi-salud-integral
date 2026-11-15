import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';
import { DailyLogPage } from './daily-log/daily-log';
import { Dashboard } from './dashboard/dashboard';
import { Home } from './home/home';
import { Shell } from './layout/shell';
import { Login } from './login/login';
import { Profile } from './profile/profile';
import { Register } from './register/register';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', component: Home },
      { path: 'ingresar', component: Login, canActivate: [guestGuard] },
      { path: 'registro', component: Register, canActivate: [guestGuard] },
      { path: 'inicio', component: Dashboard, canActivate: [authGuard] },
      { path: 'mi-perfil', component: Profile, canActivate: [authGuard] },
      { path: 'registro-diario', component: DailyLogPage, canActivate: [authGuard] },
      { path: '**', redirectTo: '' },
    ],
  },
];
