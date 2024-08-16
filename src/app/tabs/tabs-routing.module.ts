import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {TabsPage} from './tabs.page';
import {AuthGuard} from "../auth/auth.guard";

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'profile',
        loadChildren: () => import('../tabs/profile/profile.module').then(m => m.ProfilePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'reserve',
        loadChildren: () => import('../tabs/reserve/reserve.module').then(m => m.ReservePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'my-appointments',
        loadChildren: () => import('../tabs/my-appointments/my-appointments.module').then(m => m.MyAppointmentsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'admin-create-appointments',
        loadChildren: () => import('../tabs/admin-create-appointments/admin-create-appointments.module').then(m => m.AdminAppointmentsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'home',
        loadChildren: () => import('../tabs/home/home.module').then(m => m.HomePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'admin-approve-appointments',
        loadChildren: () => import('../tabs/admin-approve-appointments/admin-approve-appointments.module').then(m => m.AdminApproveAppointmentsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {
}
