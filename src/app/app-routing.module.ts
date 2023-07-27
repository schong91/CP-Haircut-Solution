import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./changepassword/changepassword.module').then( m => m.ChangepasswordPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'change-address',
    loadChildren: () => import('./change-address/change-address.module').then( m => m.ChangeAddressPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'booking-details/:id',
    loadChildren: () => import('./booking-details/booking-details.module').then( m => m.BookingDetailsPageModule)
  },
  {
    path: 'change-phone-number',
    loadChildren: () => import('./change-phone-number/change-phone-number.module').then( m => m.ChangePhoneNumberPageModule)
  },
  // {
  //   path: 'barber-details/:id',
  //   loadChildren: () => import('./barber-details/barber-details.module').then( m => m.BarberDetailsPageModule)
  // }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
