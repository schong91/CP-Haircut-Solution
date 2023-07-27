import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { LocationService } from '../services/location/location.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  isAvailable: boolean;
  isLoaded = false;

  private user: any;

  constructor(
    private auth: AuthService,
    public router: Router,
    private afs: AngularFirestore,
    private alert: AlertController,
    private toast: ToastController,
    private loading: LoadingController,
    private locationService: LocationService
  ) {

  }

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.isLoaded = true;

      } else {
        this.auth.barber$.subscribe((barber) => {
          if (barber) {
            this.user = barber;
            this.isAvailable = this.user.isAvailable;
            this.isLoaded = true;
          }
        })
      }
    })
  } // end

  setAvailable() {
    if (this.user.isAvailable === true && (this.user.isAvailable !== this.isAvailable)) {
      this.presentAlert("Start")
    } else {
      if (this.user.isAvailable === false && (this.user.isAvailable !== this.isAvailable)) {
        this.presentAlert("Stop")
      }
    }
  } // end

  // update firebase
  async updateAvailable() {
    const loading = await this.loading.create({
      spinner: 'bubbles',
      showBackdrop: true,
      backdropDismiss: false
    });
    loading.present()

    this.afs.collection('barber').doc(this.user.uid).set({
      'isAvailable': this.user.isAvailable
    }, { merge: true })
      .then(async () => {
        await loading.dismiss();
        this.presentToast("Updated successfull.", "success");
      }).catch(error => {
        loading.dismiss();
        this.presentToast(error.message, "danger");
      })
      .then(() => {
        if (this.user.isAvailable == true) {
          this.locationService.broadcastLocation(this.user);
        } else {
          this.locationService.stopBroadcast();
        };
      })
  }

  async presentAlert(message) {
    const alert = await this.alert.create({
      header: 'Are you sure',
      message: message + '<strong> broadcasting</strong> your location to other users',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.user.isAvailable = this.isAvailable;
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.updateAvailable();
          }
        }
      ]
    });
    alert.present();
  } // end

  async presentToast(message, status) {
    const toast = await this.toast.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: status
    });
    toast.present();
  } // end

  logout() {
    this.auth.logout()
  } // end
}
