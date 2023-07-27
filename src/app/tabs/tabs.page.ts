import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  user: any;
  isBarber: any
  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.getUser();
  }  // end

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
}
