import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { User } from '../interface/user';
import { AuthService } from '../services/auth.service';
import { BookingService } from '../services/booking/booking.service';
import { LocationService } from '../services/location/location.service';


@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.page.html',
  styleUrls: ['./booking-details.page.scss'],
})
export class BookingDetailsPage implements OnInit {

  isBarber: any;
  barberName: any;
  userName: any;
  booking: any;
  createdAt: any;
  endedAt: any;
  isLoaded = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private bookingService: BookingService,
    private locationService: LocationService,
    private afs: AngularFirestore,
    private auth: AuthService,
    private alert: AlertController,
    private toastCtrl: ToastController,
    private loading: LoadingController,
    private router: Router,
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.prepareData();
    // this.getUser().then(() => {
    //   let id = this.activatedRoute.snapshot.paramMap.get('id');
    //   if (id) {
    //     this.bookingService.getBooking(id).subscribe(async (booking) => {
    //       this.booking = booking;
    //       if (this.isBarber) {
    //         // barber side render user details
    //         await this.getUserName(this.booking.userId);
    //       } else {
    //         // user side render barber details
    //         await this.getBarberName(this.booking.barberId);
    //       }
    //       this.createdAt = this.getDate(this.booking.createdAt);
    //       this.endedAt = this.getDate(this.booking.endAt);          
    //       this.isLoaded = true;
    //     });
    //   }
    // });
  }

  prepareData() {
    this.isLoaded = false;
    this.getUser().then(() => {
      let id = this.activatedRoute.snapshot.paramMap.get('id');
      if (id) {
        this.bookingService.getBooking(id).subscribe(async (booking) => {
          this.booking = booking;

          if (this.isBarber) {
            // barber side render user details
            await this.getUserName(this.booking.userId);
          } else {
            // user side render barber details
            await this.getBarberName(this.booking.barberId);
          }
          this.createdAt = this.getDate(this.booking.createdAt);
          this.endedAt = this.getDate(this.booking.endAt);
          this.isLoaded = true;
        });
      }
    });
  }

  getDate(date) {
    if (date) {
      let fdate = date.toDate();
      let convertDate = {
        'date': fdate.getFullYear() + "-" + (fdate.getMonth() < 9 ? '0' + (fdate.getMonth() + 1) : fdate.getMonth()) + "-" + (fdate.getDate() < 10 ? '0' : '') + fdate.getDate(),
        'time': ((fdate.getHours() < 10 ? '0' : '') + fdate.getHours()) + ":" +
          ((fdate.getMinutes() < 10 ? '0' : '') + fdate.getMinutes()),
        'period': (fdate.getHours() > 11 ? 'pm' : 'am')
      }
      return convertDate
    }
  } // end

  getBarberName(barberId) {
    return new Promise((resolve) => {
      this.locationService.getBarber(barberId).subscribe((data) => {
        this.barberName = data.personal_details.name;
        resolve(this.barberName);
      });
    })
  } // end

  // barber side render customer name
  getUserName(userId) {
    return new Promise((resolve) => {
      this.afs.collection('user').doc<User>(userId).get().subscribe((docRef) => {
        if (docRef.exists) {
          let userData = docRef.data();
          this.userName = userData.personal_details.name;
          resolve(this.userName);
        }
      });
    })
  } // end

  getUser() {
    return new Promise((resolve) => {
      this.auth.user$.subscribe((user) => {
        if (user) {
          this.isBarber = user.personal_details.isBarber;
          resolve(this.isBarber);
        } else {
          this.auth.barber$.subscribe((barber) => {
            if (barber) {
              this.isBarber = barber.personal_details.isBarber;
              resolve(this.isBarber);
            }
          })
        }
      })
    })
  } // end


  async cancelAppointment() {
    const loading = await this.loading.create({
      spinner: 'bubbles',
      message: 'Cancelling...',
      showBackdrop: true
    });

    loading.present();

    this.bookingService.cancelBookBarber(this.booking).then((resp) => {
      this.prepareData();
      loading.dismiss();
      this.showToast('Booking has been cancelled.', 'success');
      this.router.navigate(['../tabs/tab1'])
    }, err => {
      loading.dismiss();
      this.showToast('There was a problem cancelling your booking.', 'danger');
    });
  } // end


  async completeService() {
    const loading = await this.loading.create({
      spinner: 'bubbles',
      message: 'Updating booking...',
      showBackdrop: true
    });

    loading.present();

    this.bookingService.completeBookingRequest(this.booking).then((resp) => {
      this.bookingService.updateBarberIsBook(this.booking.barberId, false);
      loading.dismiss();
      this.showToast('Booking service has been completed.', 'success');
      this.ionViewWillEnter();
    }, err => {
      loading.dismiss();
      this.showToast('There was a problem updating the booking.', 'danger');
    });
  } // end

  async confirmationAlert(action) {
    const alert = await this.alert.create({
      header: 'Are you sure',
      message: 'want to ' + action + ' booking?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Okay',
          handler: () => {
            if (action === 'cancel') {
              this.cancelAppointment();
            } else if (action === 'complete') {
              this.completeService();
            }
          }
        }
      ]
    });
    alert.present();
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


