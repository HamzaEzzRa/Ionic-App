import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomepagePageRoutingModule } from './homepage-routing.module';

import { HomepagePage } from './homepage.page';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomepagePageRoutingModule,
    ChartsModule,
    NgCircleProgressModule.forRoot({
      radius: 90,
      "space": -10,
      "outerStrokeWidth": 10,
      "outerStrokeColor": "#ff5c2a",
      "outerStrokeGradientStopColor": "#ffc62a",
      "outerStrokeGradient": true,
      "innerStrokeColor": "#e7e8ea",
      "innerStrokeWidth": 10,
      "imageSrc": "",
      "imageHeight": 105,
      "imageWidth": 105,
      "animation": false,
      "showUnits": false,
      "showBackground": false,
      "responsive": true,
      "subtitleFontSize": "13",
      "titleFontSize": "20",
      "renderOnClick": false,
      "titleFontWeight": "700",
      "subtitleFontWeight": "700",
      "subtitleColor": "#777777",
      "maxPercent": 100
    })
  ],
  declarations: [HomepagePage]
})
export class HomepagePageModule {}
