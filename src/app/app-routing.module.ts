import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'reserve',
    pathMatch: 'full'
  },
  {
    path: 'profil',
    loadChildren: () => import('./profil/profil.module').then( m => m.ProfilPageModule)
  },
  {
    path: 'reserve',
    loadChildren: () => import('./reserve/reserve.module').then( m => m.ReservePageModule)
  },
  {
    path: 'my-appointments',
    loadChildren: () => import('./my-appointments/my-appointments.module').then( m => m.MyAppointmentsPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
