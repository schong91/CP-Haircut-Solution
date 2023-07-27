import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { User } from 'src/app/interface/user';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  userCurrentLocation: any;
  barberList: any;
  distanceBarberList: any[] = [];
  timerId: any;

  private barbers: Observable<User[]>;
  private barberCollection: AngularFirestoreCollection<User>;

  constructor(
    public afs: AngularFirestore,
    private geolocation: Geolocation
  ) {
    // get barber collection from firebase
    this.barberCollection = this.afs.collection<User>('barber', ref => ref.where('isAvailable', '==', true));
    this.barbers = this.barberCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // get all available barbers in firebase
  getAvailableBarbers(): Observable<User[]> {
    return this.barbers;
  }

  // get specific barber
  getBarber(uid: string): Observable<User> {
    return this.barberCollection.doc<User>(uid).valueChanges().pipe(
      take(1),
      map(barber => {
        barber.uid = uid;
        return barber;
      })
    );
  }

  // subscribe barber data from observable
  async subscribeBarberList() {
    return new Promise((resolve, reject) => {
      this.barbers.subscribe((data) => {
        this.barberList = data;
        resolve(true);
      });
    });
  }

  // find user location
  async getUserLocation() {
    await this.geolocation.getCurrentPosition().then((resp) => {
      this.userCurrentLocation = {
        latitude: resp.coords.latitude,
        longitude: resp.coords.longitude
      };
    }).catch((err) => {
      console.log(err);
    });
  }

  // find nearest barber with distance and location
  async findNearestBarber() {
    await this.getUserLocation();

    await this.subscribeBarberList();

    this.distanceBarberList = this.getDistance(this.barberList);

    this.distanceBarberList.sort((a, b) => a.distance - b.distance);

    const filteredBarberList = this.filterBarber(this.distanceBarberList);
    return filteredBarberList;
  } // end

  filterBarber(barberList) {
    const filterBarberList = [];
    for (const barber of barberList) {
      if ((barber.distance < 10000) && barber.isBook === false) {
        filterBarberList.push(barber);
      }
    }
    return filterBarberList;
  }

  getDistance(barberList) {
    const userLocation = {
      lat: this.userCurrentLocation.latitude,
      lng: this.userCurrentLocation.longitude
    };

    barberList.map((barber) => {
      const barberLocation = {
        lat: barber.curr_location.latitude,
        lng: barber.curr_location.longitude
      };
      barber.distance = this.calDistance(
        userLocation,
        barberLocation
      ).toFixed(2);
    });
    return barberList;
  } // end

  // distance calculation - Harvesine formula
  calDistance(user, barber) {
    const R = 6371; // km
    const dLat = this.toRad((barber.lat - user.lat));
    const dLng = this.toRad((barber.lng - user.lng));
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(barber.lat)) * Math.cos(this.toRad(user.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  } // end

  toRad(x) {
    return x * Math.PI / 180;
  } // end

  // barber action
  async updateBarberLocation(barber) {
    // get barber location
    await this.getUserLocation();

    // then update to firebase
    this.afs.collection('barber').doc(barber.uid).set({
      curr_location: this.userCurrentLocation
    }, { merge: true })
      .catch((err) => {
        console.log(err);
      });
  } // end

  async broadcastLocation(barber) {
    await this.updateBarberLocation(barber);

    this.timerId = setInterval(async () => {
      await this.getUserLocation();
      this.updateBarberLocation(barber);
    }, 900000);
  } // end

  stopBroadcast() {
    clearInterval(this.timerId);
  } //end
}
