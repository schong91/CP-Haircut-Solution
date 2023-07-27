import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-change-phone-number',
  templateUrl: './change-phone-number.page.html',
  styleUrls: ['./change-phone-number.page.scss'],
})
export class ChangePhoneNumberPage implements OnInit {

  collection: string;
  userDetails: any = [];
  userId: any;
  phone_number: '';

  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController
  ) { }

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

  validateNewPhone(phone) {
    if (!phone) {
      this.presentToast("Please enter the address you want to change.", "warning");
      return false;
    }
    return true;
  }

  async updatePhoneNumber() {
    if (this.validateNewPhone(this.phone_number)) {
      const loading = await this.loading.create({
        spinner: 'bubbles',
        showBackdrop: true
      });

      loading.present()

      this.afs.collection(this.collection).doc(this.userId).set({
        'personal_details': {
          'phone_number': this.phone_number
        }
      }, { merge: true }).then(() => {
        loading.dismiss();
        this.presentToast("Your phone number have been changed.", "success");
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
