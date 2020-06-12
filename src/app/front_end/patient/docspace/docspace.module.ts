import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocspacePageRoutingModule } from './docspace-routing.module';

import { DocspacePage } from './docspace.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocspacePageRoutingModule
  ],
  declarations: [DocspacePage]
})
export class DocspacePageModule {}
