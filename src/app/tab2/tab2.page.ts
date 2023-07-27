import { Component } from '@angular/core';
import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { BarberDetailsComponent } from '../barber-details/barber-details.component';
import { BookingRequestDetailsComponent } from '../booking-request-details/booking-request-details.component';
import { User } from '../interface/user';
import { AuthService } from '../services/auth.service';
import { BookingService } from '../services/booking/booking.service';
import { LocationService } from '../services/location/location.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  user: any;
  barberId: any;
  isBarber: any;
  barberAvailable: any;
  isLoaded = false;
  canManualUpdate = true;
  nearestBarberList: any;
  bookingRequest: any;

  constructor(
    public location: LocationService,
    public modalController: ModalController,
    public loading: LoadingController,
    public auth: AuthService,
    public bookingService: BookingService,
    public toastCtrl: ToastController
  ) { }

  ngOnInit() {
  }

  // trigger this function when enter the page
  ionViewWillEnter() {
    this.getUser().then(() => {
      if (this.isBarber && this.barberAvailable) {
        if (this.location.timerId === undefined) {
          this.location.broadcastLocation(this.user);
        }
        this.getBookingRequest();
      } else if (!this.isBarber) {
        this.findNearestBarbers();
      } else {
        this.isLoaded = true;
      }
    })
  }

  // barber details' pop out modal
  async barberDetails(id) {
    const modal = await this.modalController.create({
      component: BarberDetailsComponent,
      cssClass: 'barberDetailsModal',
      showBackdrop: true,
      componentProps: {
        uid: id
      }
    });

    await modal.present();
  } // end

  async findNearestBarbers() {
    const loading = await this.loading.create({
      spinner: 'crescent',
      message: 'Finding nearest barbers...',
      showBackdrop: true
    });
    loading.present();

    this.nearestBarberList = await this.location.findNearestBarber();
    loading.dismiss();
    this.isLoaded = true;
  } // end

  async bookingRequestDetails(booking) {
    const modal = await this.modalController.create({
      component: BookingRequestDetailsComponent,
      cssClass: 'requestDetailsModal',
      componentProps: {
        booking: booking
      },
      showBackdrop: true
    })
    await modal.present();

    await modal.onDidDismiss().then((msg) => {
      if (msg.data) {
        this.ionViewWillEnter();
      }
    });
  } // end  


  async getBookingRequest() {
    this.bookingRequest = [];

    let request = await this.bookingService.getBookingRequest(this.barberId);
    request.forEach(x => {
      x.formattedDate = this.getDate(x.createdAt);
    })

    await this.bookingService.renderUserDetails(request);
    this.bookingRequest = request

    this.bookingRequest.sort((a, b) => {
      return b.createdAt.seconds - a.createdAt.seconds;
    })

    this.isLoaded = true
  } // end

  doRefresh(event) {
    if (this.isBarber) {
      this.getBookingRequest();
    } else {
      this.findNearestBarbers();
    }
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  } // end

  // check user is barber or not
  getUser() {
    return new Promise((resolve) => {
      this.auth.user$.subscribe((user) => {
        if (user) {
          this.user = user;
          this.isBarber = user.personal_details.isBarber;
          resolve(this.isBarber);
        } else {
          this.auth.barber$.subscribe((barber) => {
            if (barber) {
              this.barberId = barber.uid;
              this.user = barber;
              this.barberAvailable = barber.isAvailable;
              this.isBarber = barber.personal_details.isBarber;
              resolve(this.isBarber);
            }
          })
        }
      })
    })
  } // end

  getDate(date) {
    if (date) {
      let fdate = date.toDate();
      let convertDate = {
        'date': fdate.getFullYear() + "-" + (fdate.getMonth() + 1) + "-" + fdate.getDate(),
        'time': ((fdate.getHours() < 10 ? '0' : '') + fdate.getHours()) + ":" +
          ((fdate.getMinutes() < 10 ? '0' : '') + fdate.getMinutes()),
        'period': (fdate.getHours() > 11 ? 'pm' : 'am')
      }

      return convertDate
    }
  } // end

  updateLocationManual() {
    this.canManualUpdate = false;
    this.location.updateBarberLocation(this.user).then(() => {
      this.showToast('Update location successfull.', 'success');
      setTimeout(() => {
        this.canManualUpdate = true;
      }, 3000);
    }).catch((error) => {
      this.showToast('There was a problem updating your location.', 'danger');
    })
  } // end

  showToast(msg, color) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'top',
      color: color
    }).then(toast => toast.present());
  } // end
}
