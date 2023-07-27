import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertController, LoadingController, ModalController, NavController, NavParams, ToastController } from '@ionic/angular';
import { Booking } from '../interface/booking';
import { BookingService } from '../services/booking/booking.service';
import { LocationService } from '../services/location/location.service';

@Component({
  selector: 'app-barber-details',
  templateUrl: './barber-details.component.html',
  styleUrls: ['./barber-details.component.scss'],
})
export class BarberDetailsComponent implements OnInit {

  userId: any;
  barber: any;
  isLoaded = false;
  daddress = '';

  booking: Booking = {
    userId: '',
    barberId: '',
    userLocation: {
      'latitude': '',
      'longitude': '',
      'address': ''
    },
    barberLocation: {
      'latitude': '',
      'longitude': '',
      'address': ''
    },
    createdAt: null,
    status: '',
    endAt: null
  }

  constructor(
    private locationService: LocationService,
    private modalCtrl: ModalController,
    private navParam: NavParams,
    private afAuth: AngularFireAuth,
    private bookingService: BookingService,
    private toast: ToastController,
    private alert: AlertController,
    private loading: LoadingController,
    private nav: NavController
  ) { }

  async ngOnInit() {
    await this.getCurrentUser();
  }

  ionViewWillEnter() {
    let id = this.navParam.data.uid;
    if (id) {
      this.locationService.getBarber(id).subscribe(barber => {
        this.barber = barber
        this.isLoaded = true;
      });
    }
  }


  async getCurrentUser() {
    await this.afAuth.onAuthStateChanged(user => {
      if (user) {
        this.userId = user.uid;
      }
    })
  } // end

  async setBookingDetails() {
    this.booking = {
      'userId': this.userId,
      'barberId': this.barber.uid,
      'barberLocation': {
        'latitude': this.barber.curr_location.latitude,
        'longitude': this.barber.curr_location.longitude,
        'address': await this.getAddress(this.barber.curr_location)
      },
      'userLocation': {
        'latitude': this.locationService.userCurrentLocation.latitude,
        'longitude': this.locationService.userCurrentLocation.longitude,
        'address': await this.getAddress(this.locationService.userCurrentLocation)
      },
      'createdAt': new Date(),
      'status': 'requesting',
      'endAt': null
    }
  } // end

  // Google geocoder API
  // async getAddress(curr_location) {
  // let address: any;
  // await this.bookingService.getReadableAdress(curr_location).then((data) => {
  //   address = data;
  // })
  // return address;
  // } // end

  // Ionic native geocoder API
  async getAddress(curr_location) {
    try {
      const address = await this.bookingService.reverseGeocoder(curr_location.latitude, curr_location.longitude);
      this.daddress =
        (address?.areasOfInterest[0] ? address?.areasOfInterest[0] + ', ' : '') +
        (address?.thoroughfare ? address?.thoroughfare + ', ' : '') +
        (address?.subLocality ? address?.subLocality + ', ' : '') +
        (address?.postalCode + ', ') +
        (address?.locality + ', ') +
        (address?.administrativeArea ? address?.administrativeArea + ', ' : '') +
        (address?.countryName);
      return this.daddress;
    } catch (e) {
      return "Dummy Address";
    }
  }

  async bookBarber() {
    const loading = await this.loading.create({
      spinner: 'bubbles',
      message: 'Sending request to barbers...',
      showBackdrop: true
    });

    await this.setBookingDetails();

    this.bookingService.validateBookingRequest(this.booking.userId).then((invalid) => {
      if (!invalid) {
        loading.present();
        this.bookingService.addBooking(this.booking).then(() => {
          loading.dismiss();
          this.notifySucess();
        }), (error) => {
          this.presentToast(error.message, 'danger');
        }
      } else {
        loading.dismiss();
        this.notifyFailure();
      }
    }, error => {
      this.presentToast(error.message, 'danger');
    });
  } // end

  closeModal() {
    this.modalCtrl.dismiss();
  } // end

  async confirmationAlert() {
    const alert = await this.alert.create({
      header: 'Are you sure',
      message: 'want to book this barber?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Okay',
          handler: () => {
            this.bookBarber();
          }
        }
      ]
    });
    alert.present();
  } // end

  async notifySucess() {
    const alert = await this.alert.create({
      header: 'Request Sent!',
      message: 'Please wait for the barber to response.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.closeModal();
            this.nav.navigateRoot("/tabs/tab1");
          }
        }
      ]
    });
    alert.present();
  } // end

  async notifyFailure() {
    const alert = await this.alert.create({
      header: 'Request Fail to Send!',
      message: 'You have already book for a barber. Please cancel the appointment to book for new barber.',
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

  async presentToast(message, status) {
    const toast = await this.toast.create({
      message: message,
      color: status,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  } // end
}
