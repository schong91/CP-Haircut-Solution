import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangeAddressPage } from './change-address.page';

const routes: Routes = [
  {
    path: '',
    component: ChangeAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeAddressPageRoutingModule {}
