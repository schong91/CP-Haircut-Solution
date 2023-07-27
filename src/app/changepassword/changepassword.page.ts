import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import 'firebase/app';
import firebase from 'firebase/app'

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.page.html',
  styleUrls: ['./changepassword.page.scss'],
})
export class ChangepasswordPage implements OnInit {

  collection: string;
  userId: string;
  userDetails: any;
  password: any = {
    old: '',
    new: '',
    confirm: '',
  }

  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        this.userDetails = user.personal_details;
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

  validateNewPassword(password) {
    if (!password.old && !password.new && !password.confirm) {
      this.presentToast("Please enter all the field.", "warning");
      return false;
    }
    if (!password.old) {
      this.presentToast("Please enter your password.", "warning");
      return false;
    }
    if (!password.new) {
      this.presentToast("Please enter your new password.", "warning");
      return false;
    }
    if (!password.confirm) {
      this.presentToast("Please enter your new password again.", "warning");
      return false;
    }
    if (!!password.new && password.new.length < 6) {
      this.presentToast("Password lenght must have reach at least six", "danger");
      password.confirm = '';
      return false;
    }
    if ((!!password.new && !!password.confirm) && password.new !== password.confirm) {
      this.presentToast("New passwords do not match. Please enter the password again", 'warning');
      password.confirm = '';
      return false;
    }
    if (password.old !== this.userDetails.password) {
      this.presentToast("Old password does not match with database. Please enter the correct password.", 'danger');
      return false;
    }
    return true;
  } // end

  async updatePassword() {
    if (this.validateNewPassword(this.password)) {
      const loading = await this.loading.create({
        spinner: 'bubbles',
        showBackdrop: true,
        duration: 2000
      });

      loading.present();

      // update sign in details
      let user = firebase.auth().currentUser
      user.updatePassword(this.password.new).then(() => {
        // update database
        this.afs.collection(this.collection).doc(this.userId).set({
          'personal_details': {
            'password': this.password.new
          }
        }, { merge: true }).then(() => {
          loading.dismiss();
          this.presentToast("Your password have been changed.", "success");
          this.router.navigate(['/tabs/tab3'])
        }).catch(error => {
          this.presentToast(error.message, "danger");
        })
      }).catch((error) => {
        this.presentToast('There was a problem updating your password due to credentail too old. Please resign in to your account.', 'danger');
      })
    }
  } // end

  async presentToast(message, status) {
    const toast = await this.toastController.create({
      message: message,
      color: status,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  } // end

}
