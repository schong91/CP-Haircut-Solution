import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { Tab2PageRoutingModule } from './tab2-routing.module';
import { BarberDetailsComponent } from '../barber-details/barber-details.component';
import { BookingRequestDetailsComponent } from '../booking-request-details/booking-request-details.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab2PageRoutingModule
  ],
  declarations: [Tab2Page, BarberDetailsComponent, BookingRequestDetailsComponent],
  entryComponents: [BarberDetailsComponent, BookingRequestDetailsComponent]
})
export class Tab2PageModule { }
