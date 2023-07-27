import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, NavParams, ToastController } from '@ionic/angular';
import { BookingService } from '../services/booking/booking.service';

@Component({
  selector: 'app-booking-request-details',
  templateUrl: './booking-request-details.component.html',
  styleUrls: ['./booking-request-details.component.scss'],
})
export class BookingRequestDetailsComponent implements OnInit {

  booking: any
  isLoaded = false

  constructor(
    public modalCtrl: ModalController,
    private navParam: NavParams,
    private loading: LoadingController,
    private alert: AlertController,
    private toast: ToastController,
    private bookingService: BookingService,
    private nav: NavController
  ) { }

  ngOnInit() {    
   }

  ionViewWillEnter() {
    let booking = this.navParam.data.booking;
    if (booking) {
      this.booking = booking
      this.isLoaded = true;
    }
  }

  async acceptRequest() {
    const loading = await this.loading.create({
      spinner: 'bubbles',
      message: 'Updating request...',
      showBackdrop: true
    });

    this.bookingService.validateAcceptedBookingRequest(this.booking.barberId).then((invalid) => {
      if (!invalid) {
        loading.present();
        this.bookingService.acceptBookingRequest(this.booking).then((resp) => {
          this.bookingService.updateBarberIsBook(this.booking.barberId, true);
          loading.dismiss();
          this.showToast('Booking request accepted.', 'success');
          this.closeModal();
          this.nav.navigateRoot(`/booking-details/${this.booking.bid}`);
        }, err => {
          loading.dismiss();
          this.showToast('There was a problem accepting the booking request.', 'danger');
          this.closeModal();
        });
      } else {
        loading.dismiss();
        this.notifyFailure();
      }
    }, error => {
      this.showToast(error.message, 'danger');
    });
  } // end

  async rejectRequest() {
    const loading = await this.loading.create({
      spinner: 'bubbles',
      message: 'Rejecting...',
      showBackdrop: true
    });

    loading.present();

    this.bookingService.rejectBookingRequest(this.booking).then((resp) => {
      loading.dismiss();
      this.showToast('Booking has been rejected.', 'success');
      this.closeModal("rejected");
    }, err => {
      loading.dismiss();
      this.showToast('There was a problem rejecting the booking request.', 'danger');
      this.closeModal();
    });
  } // end

  async confirmationAlert(action) {
    const alert = await this.alert.create({
      header: 'Are you sure',
      message: 'want to ' + action + ' this booking?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Okay',
          handler: () => {
            if (action === 'reject') {
              this.rejectRequest();
            } else if (action === 'accept') {
              this.acceptRequest();
            }
          }
        }
      ]
    });
    alert.present();
  } // end

  async notifyFailure() {
    const alert = await this.alert.create({
      header: 'Request Fail to Accept!',
      message: 'You have already accept a request. Please complete the request before accepting another booking request',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.closeModal();
          }
        }
      ]
    });
    alert.present();
  } // end


  closeModal(msg?: string) {
    this.modalCtrl.dismiss(msg);
  } // end

  showToast(msg, color) {
    this.toast.create({
      message: msg,
      duration: 2000,
      position: 'top',
      color: color
    }).then(toast => toast.present());
  } // end

}
