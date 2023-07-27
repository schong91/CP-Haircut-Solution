import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
// import * as firebase from 'firebase/app'
// import { AngularFireAuth } from '@angular/fire/auth';



@Component({
  selector: 'app-change-address',
  templateUrl: './change-address.page.html',
  styleUrls: ['./change-address.page.scss'],
})
export class ChangeAddressPage implements OnInit {

  collection: string;
  userDetails: any = [];
  userId: any;
  address: any;

  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController
    // private authFire: AngularFireAuth
  ) { }

  // todo: add this feature to barble
  ngOnInit() {
    this.auth.user$.subscribe((result) => {
      if (result) {
        this.userId = result.uid;
        this.userDetails = result.personal_details;
        this.collection = 'user';
      } else {
        this.auth.barber$.subscribe((barber) => {
          if (barber) {
            this.userId = barber.uid;
            this.userDetails = barber.personal_details;
            this.collection = 'barber';
          }
        })
      }
    })
  }

  validateNewAddress(address) {
    if (!address) {
      this.presentToast("Please enter the address you want to change.", "warning");
      return false;
    }
    return true;
  }

  async updateAddress() {
    if (this.validateNewAddress(this.address)) {
      const loading = await this.loading.create({
        spinner: 'bubbles',
        showBackdrop: true
      });

      loading.present()

      this.afs.collection(this.collection).doc(this.userId).set({
        'personal_details': {
          'address': this.address
        }
      }, { merge: true }).then(() => {
        loading.dismiss();
        this.presentToast("Your address have been changed.", "success");
        this.router.navigate(['/tabs/tab3'])
      }).catch(error => {
        this.presentToast(error.message, "danger");
      })
    }
  }

  async presentToast(message, status) {
    const toast = await this.toastController.create({
      message: message,
      color: status,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

}