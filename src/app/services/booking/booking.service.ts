import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Booking } from 'src/app/interface/booking';
import { User } from 'src/app/interface/user';
import { map, take } from 'rxjs/operators';
import { LoadingController, ToastController } from '@ionic/angular';

import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private bookings: Observable<Booking[]>;
  private bookingCollection: AngularFirestoreCollection<Booking>;
  bookingHistory: any;
  address: string;

  constructor(
    private nativeGeocoder: NativeGeocoder,
    private afs: AngularFirestore,
    private loading: LoadingController
  ) {
    this.bookingCollection = this.afs.collection<Booking>('booking');
    this.bookings = this.bookingCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const bid = a.payload.doc.id;
        return { bid, ...data };
      }))
    );
  }

  getBookings(): Observable<Booking[]> {
    return this.bookings;
  }

  getBooking(bid: string): Observable<Booking> {
    return this.bookingCollection.doc<Booking>(bid).valueChanges().pipe(
      take(1),
      map(booking => {
        booking.bid = bid;
        return booking;
      })
    );
  }

  addBooking(booking: Booking): Promise<DocumentReference> {
    return this.bookingCollection.add(booking);
  } // end

  // customer action
  cancelBookBarber(booking: Booking) {
    return this.bookingCollection.doc(booking.bid).update({
      status: 'cancelled',
      endAt: new Date(Date.now()),
    });
  } // end

  // barber action
  acceptBookingRequest(booking) {
    return this.bookingCollection.doc(booking.bid).update({
      status: 'accepted'
    });
  } // end

  rejectBookingRequest(booking) {
    return this.bookingCollection.doc(booking.bid).update({
      status: 'rejected',
      endAt: new Date(Date.now()),
    });
  } // end

  completeBookingRequest(booking: Booking) {
    return this.bookingCollection.doc(booking.bid).update({
      status: 'completed',
      endAt: new Date(Date.now()),
    });
  } // end

  /** get history */
  async subscribeBookingList() {
    return new Promise((resolve, reject) => {
      this.bookings.subscribe((data) => {
        this.bookingHistory = data;
        resolve(this.bookingHistory);
      });
    });
  }  // end

  async getBarberBookingHistory(barberId) {
    await this.subscribeBookingList();
    const history = [];
    for (const d of this.bookingHistory) {
      if (d.barberId === barberId && (d.status !== 'requesting')) {
        history.push(d);
      }
    }
    return history;
  }


  async getUserBookingHistory(userId) {
    await this.subscribeBookingList();
    const history = [];
    for (const d of this.bookingHistory) {
      if (d.userId === userId) {
        history.push(d);
      }
    }
    return history;
  }

  /**  to check if a user got send multiple request to multiple barber or not
  // 1. find userId from booking document
  // 2. check booking status
  // 2.1 if request extisting, deny the user from booking for another barber
  // 2.2 else allow booking
   */
  async validateBookingRequest(userId) {
    let invalidBooking = true;
    const x = 'requesting';
    const y = 'accepted';

    const loading = await this.loading.create({
      spinner: 'bubbles',
      message: 'Validating request...',
      showBackdrop: true
    });

    loading.present();

    const history = await this.getUserBookingHistory(userId);

    invalidBooking = history.some(booking => booking.status === x || booking.status === y);
    loading.dismiss();

    return invalidBooking;
  } // end

  async validateAcceptedBookingRequest(barberId) {
    let invalidBooking = true;
    const y = 'accepted';

    const loading = await this.loading.create({
      spinner: 'bubbles',
      message: 'Validating response...',
      showBackdrop: true
    });

    loading.present();

    const history = await this.getBarberBookingHistory(barberId);

    invalidBooking = history.some(booking => booking.status === y);
    loading.dismiss();

    return invalidBooking;
  } // end

  // render booking details
  renderUserDetails(bookings) {
    // return new Promise((resolve) => {
    //   this.afs.collection('user').doc<User>(booking.userId).get().subscribe(docRef => {
    //     if (docRef.exists) {
    //       let userData = docRef.data();
    //       let userName = userData.personal_details.name;
    //       booking['userName'] = userName;
    //       resolve(booking);
    //     }
    //   })
    // })
    return new Promise((resolve) => {
      for (const booking of bookings) {
        this.afs.collection('user').doc<User>(booking.userId).get().subscribe(docRef => {
          if (docRef.exists) {
            const userData = docRef.data();
            const userName = userData.personal_details.name;
            booking.userName = userName;
          }
        });
      }
      resolve(bookings);
    });
  } // end

  renderBarberDetails(bookings) {
    return new Promise((resolve) => {
      for (const booking of bookings) {
        this.afs.collection('barber').doc<User>(booking.barberId).get().subscribe(docRef => {
          if (docRef.exists) {
            const userData = docRef.data();
            const userName = userData.personal_details.name;
            booking.barberName = userName;
          }
        });
      }
      resolve(bookings);
    });
  } // end


  async getBookingRequest(barberId) {
    await this.subscribeBookingList();
    const bookingRequest = [];
    for (const b of this.bookingHistory) {
      if ((b.barberId === barberId) && (b.status === 'requesting')) {
        bookingRequest.push(b);
      }
    }
    return bookingRequest;
  } // end


  async updateBarberIsBook(barberId, isBook) {
    await this.afs.collection('barber').doc(barberId).set({
      isBook
    }, { merge: true });
  } // end

  geocoderoptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };

  reverseGeocoder(lat, lng) {
    return this.nativeGeocoder.reverseGeocode(lat, lng, this.geocoderoptions)
      .then((result: NativeGeocoderResult[]) => result[0])
      .catch((error: any) => {
        throw (error);
      });
  }
}


