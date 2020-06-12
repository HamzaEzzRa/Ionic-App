import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-popovercomponent',
  templateUrl: './popovercomponent.page.html',
  styleUrls: ['./popovercomponent.page.scss'],
})
export class PopovercomponentPage implements OnInit {

  constructor(private popover:PopoverController, private authService: AuthService) { }

  ClosePopover()
   {
    this.popover.dismiss();
   }

  ngOnInit() {
  }

  onLogout() {
    this.authService.logout();
    this.ClosePopover();
  }

}
