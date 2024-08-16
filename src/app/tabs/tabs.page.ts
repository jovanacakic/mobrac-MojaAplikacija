import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  _isAdmin: boolean = false;
  constructor(private authService: AuthService) {
    this._isAdmin = this.authService.isUserAdmin;
  }

  ngOnInit() {
    this._isAdmin = this.authService.isUserAdmin;
    console.log("cao");
  }

}
