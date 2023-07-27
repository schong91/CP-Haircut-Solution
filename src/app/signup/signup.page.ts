import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { User } from '../interface/user';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  cpassword: string;

  user: User = {
    personal_details: {
      name: '',
      password: '',
      address: '',
      phone_number: null,
      email: '',
      isBarber: '0',
      user_photo: ''
    },
    company_details: {
      work_company: '',
      work_company_phone: null
    }
  }

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private alert: AlertController,
    private toast: ToastController,
    private loading: LoadingController
  ) {
  }

  ngOnInit() {
  }

  validateDetails(data) {
    if (!data.personal_details.name) {
      this.presentToast("Please enter your name.", "warning");
      return false;
    }
    if (!data.personal_details.phone_number) {
      this.presentToast("Please enter your phone number.", "warning");
      return false;
    }
    if (!data.personal_details.address) {
      this.presentToast("Please enter your address.", "warning");
      return false;
    }
    if (!data.personal_details.email) {
      this.presentToast("Please enter your email address.", "warning");
      return false;
    } else if (!!data.personal_details.email) {
      let pattern = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{1,4}$");
      if (!(pattern.test(data.personal_details.email))) {
        this.presentToast("Please enter valid email address", "warning");
        return false;
      }
    }
    if (!data.personal_details.password) {
      this.presentToast("Please enter your password.", "warning");
      return false;
    }
    if (!!data.personal_details.password && data.personal_details.password.length < 6) {
      this.presentToast("Password lenght must have reach at least six", "danger");
      return false;
    }
    if (!!data.personal_details.password && (data.personal_details.password !== this.cpassword)) {
      this.presentToast("Passwords do not match. Please enter the password again", 'warning');
      this.cpassword = '';
      return false;
    }
    if (data.personal_details.isBarber === "1") {
      if (!data.company_details.work_company) {
        this.presentToast("Please enter working company name.", "warning");
        return false;
      }
      if (!data.company_details.work_company_phone) {
        this.presentToast("Please enter company phone number.", "warning");
        return false;
      }
    }
    return true;
  }

  async signUp() {
    if (this.validateDetails(this.user)) {
      const loading = await this.loading.create({
        message: "Processing...",
        spinner: 'bubbles',
        showBackdrop: true
      });

      loading.present();

      this.afAuth.createUserWithEmailAndPassword(this.user.personal_details.email, this.user.personal_details.password)
        .then((data) => {
          if (this.user.personal_details.isBarber === '1') {
            this.afs.collection('barber').doc(data.user.uid).set({
              'uid': data.user.uid,
              'personal_details': {
                'name': this.user.personal_details.name,
                'password': this.user.personal_details.password,
                'address': this.user.personal_details.address,
                'phone_number': this.user.personal_details.phone_number,
                'email': this.user.personal_details.email,
                'isBarber': true,
                'user_photo': this.user.personal_details.user_photo
              },
              'company_details': {
                'work_company': this.user.company_details.work_company,
                'work_company_phone': this.user.company_details.work_company_phone,
              },
              'isAvailable': false,
              'isBook': false,
              'curr_location': {}
            }).then(() => {
              loading.dismiss()
              this.presentAlertConfirm();
            }).catch(error => {
              this.presentToast(error.message, "danger")
            })
          } else {
            this.afs.collection('user').doc(data.user.uid).set({
              'uid': data.user.uid,
              'personal_details': {
                'name': this.user.personal_details.name,
                'password': this.user.personal_details.password,
                'address': this.user.personal_details.address,
                'phone_number': this.user.personal_details.phone_number,
                'email': this.user.personal_details.email,
                'isBarber': false,
                'user_photo': this.user.personal_details.user_photo
              },
              'company_details': {
                'work_company': this.user.company_details.work_company,
                'work_company_phone': this.user.company_details.work_company_phone,
              }
            }).then(() => {
              loading.dismiss()
              this.presentAlertConfirm();
            }).catch(error => {
              this.presentToast(error.message, "danger")
            })
          }
        })
    }
  }

  async presentToast(message, color) {
    const toast = await this.toast.create({
      message: message,
      color: color,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

  async presentAlertConfirm() {
    const alert = await this.alert.create({
      header: 'Sign Up Succesfully!',
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}
