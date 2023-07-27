import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangeAddressPageRoutingModule } from './change-address-routing.module';

import { ChangeAddressPage } from './change-address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeAddressPageRoutingModule
  ],
  declarations: [ChangeAddressPage]
})
export class ChangeAddressPageModule {}
