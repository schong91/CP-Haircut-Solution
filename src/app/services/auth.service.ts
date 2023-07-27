import { Injectable } from '@angular/core';
import { User } from '../interface/user';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';


// router
import { Router } from '@angular/router';

// loading, toast, alert
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;
  // user: User;

  barber$: Observable<User>;
  // barber: User;

  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public router: Router,
    public toast: ToastController,
    public loading: LoadingController
  ) {
    // get user
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`user/${user.uid}`).valueChanges();
        } else {
          // return empty observable array
          return of(null);
        }
      })
    )

    // get barber
    this.barber$ = this.afAuth.authState.pipe(
      switchMap(barber => {
        if (barber) {
          return this.afs.doc<User>(`barber/${barber.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    )
  } // end

  // async getDocument(id) {
  //   await this.afs.collection('user').doc(id).get().toPromise().then((doc) => {
  //     if (doc.exists) {
  //       this.user$ = this.afs.doc<User>(`user/${id}`).valueChanges();
  //       return this.user$;
  //     } else {
  //       this.user$ = this.afs.doc<User>(`barber/${id}`).valueChanges();
  //       return this.user$;
  //     }
  //   })
  // }

  // login
  async login(email, password) {
    const loading = await this.loading.create({
      spinner: 'bubbles',
      showBackdrop: true
    });

    loading.present();

    this.afAuth.setPersistence(firebase.default.auth.Auth.Persistence.LOCAL).then(() => {
      this.afAuth.signInWithEmailAndPassword(email, password).then((result) => {
        loading.dismiss();
        this.router.navigate(['/tabs']);
      }).catch((error) => {
        loading.dismiss();
        this.presentToast(error.message);
      })
    }).catch(error => {
      // todo: check here console got throw error
      this.presentToast(error.message);
    })
  } // end

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/login']);
      // this.afs.firestore.disableNetwork();
    });
  } // end

  //  toast
  async presentToast(message) {
    const toast = await this.toast.create({
      message: message,
      duration: 2000,
      position: 'middle',
    });
    toast.present();
  }

}

