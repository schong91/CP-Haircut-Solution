import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginInfo:any ={
    email: '',
    password: ''
  }

  // todo: add validation here if got time

  constructor(
    public auth: AuthService,
    public toastController: ToastController
    ) { }

  ngOnInit() {    
  }

  ionViewWillEnter() {
    this.loginInfo = {
      email: '',
      password: ''
    }
  }

  login() {
    if (this.loginInfo.email && this.loginInfo.password) {
      this.auth.login(this.loginInfo.email, this.loginInfo.password)
    } else {
      this.presentToast("Please enter your email and password.", "warning");
    }
  }

  async presentToast(message, status) {
    const toast = await this.toastController.create({
      message: message,
      color: status,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }
}
