import { Component, OnInit, Renderer2, Input } from '@angular/core';
import { PopoverController, DomController } from '@ionic/angular';
import { PopovercomponentPage } from './popovercomponent/popovercomponent.page';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(public popoverController: PopoverController) { }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopovercomponentPage,
      cssClass: 'popover-class',
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  ngOnInit() {
  }

}
