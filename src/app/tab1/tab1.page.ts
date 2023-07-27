import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { BookingService } from '../services/booking/booking.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  user: any;
  isBarber: any;
  bookingHistory: any;
  filteredBookingHistory: any;
  isLoaded = false;
  filterOption = 'recent';

  constructor(
    private bookingService: BookingService,
    private auth: AuthService,
    private nav: NavController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.prepareData();
  }

  prepareData() {
    this.isLoaded = false;
    this.bookingHistory = [];
    this.getUser().then(async () => {
      if (this.isBarber) {
        this.getBarberBookingHistory();
      } else {
        this.getUserBookingHistory();
      }
    });
  } // end

  async getUserBookingHistory() {
    let history = await this.bookingService.getUserBookingHistory(this.user.uid);

    history.forEach(x => {
      x.formattedDate = this.getDate(x.createdAt);
    })

    await this.bookingService.renderBarberDetails(history);
    this.bookingHistory = history

    this.bookingHistory.sort((a, b) => {
      return b.createdAt.seconds - a.createdAt.seconds;
    })

    this.filter();
    this.isLoaded = true
  } // end

  async getBarberBookingHistory() {
    let history = await this.bookingService.getBarberBookingHistory(this.user.uid);

    history.forEach(x => {
      x.formattedDate = this.getDate(x.createdAt);
    })

    await this.bookingService.renderUserDetails(history);
    this.bookingHistory = history;

    this.bookingHistory.sort((a, b) => {
      return b.createdAt.seconds - a.createdAt.seconds;
    })

    this.filter();
    this.isLoaded = true
  } // end

  getUser() {
    return new Promise((resolve) => {
      this.auth.user$.subscribe((user) => {
        if (user) {
          this.user = user;
          this.isBarber = user.personal_details.isBarber;
          resolve(this.user);
        } else {
          this.auth.barber$.subscribe((barber) => {
            if (barber) {
              this.user = barber;
              this.isBarber = barber.personal_details.isBarber;
              resolve(this.user);
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
        'time': ((fdate.getHours() < 10? '0' : '') + fdate.getHours()) + ":" + 
                ((fdate.getMinutes() < 10 ? '0' : '') + fdate.getMinutes()),
        'period': (fdate.getHours() > 11 ? 'pm' : 'am')
      }
      return convertDate
    }
  } // end

  doRefresh(event) {
    this.ionViewWillEnter();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  } // end

  filter() {
    let option = this.filterOption;
    if (this.bookingHistory && this.bookingHistory.length >= 4) {
      if (option === 'recent') {
        let size = 3;
        this.filteredBookingHistory = this.bookingHistory.slice(0, size);
      } else if (option === 'all') {
        this.filteredBookingHistory = this.bookingHistory;
      }
    } else {
      this.filteredBookingHistory = this.bookingHistory;
    }
  } // end

  onChange() {
    setTimeout(() => {
      this.filter();
    })
  } // end

  goBookingDetails(bid) {
    this.nav.navigateRoot(`/booking-details/${bid}`);
  } // end
}


