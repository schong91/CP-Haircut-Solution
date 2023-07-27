import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BarberDetailsPage } from './barber-details.page';

const routes: Routes = [
  {
    path: '',
    component: BarberDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BarberDetailsPageRoutingModule {}
