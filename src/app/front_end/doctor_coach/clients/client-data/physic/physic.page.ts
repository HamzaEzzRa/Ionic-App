import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Diseases, Handicaps } from '../../../../../selectionList';
import { Physic } from './physic.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/auth/auth.service';
import { Plugins } from '@capacitor/core';
import { RequestManagerService } from '../../../request-manager.service';

@Component({
  selector: 'app-physic',
  templateUrl: './physic.page.html',
  styleUrls: ['./physic.page.scss'],
})
export class PhysicPage implements OnInit {

  public isFetching: boolean = true;
  public diseases = Diseases.list;
  public handicaps = Handicaps.list;
  public dataSanitaire: Physic = {};
  public physicOrMedical = true;
  public noEditing: boolean = true;
  private otherId: string;

  constructor(
    private requestManager: RequestManagerService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.isFetching = true;
    Plugins.Storage.get({ key: "selectedData" }).then(storedData => {
      if (storedData) {
        const parsedData = JSON.parse(storedData.value) as {
          otherId: string;
        }
        if (parsedData) {
          this.otherId = parsedData.otherId;

          /*
          this.http.get<Physic>(
            environment.apiUrl + `/${this.authService.role}/patientData/otherData/${this.authService.userId}/${this.otherId}`,{ 
              responseType: 'json' 
            }
          )
          */
          this.requestManager.getPatientPhysMedData(this.otherId)
          .subscribe(response => {
            console.log(response);
            this.dataSanitaire = response;
            this.isFetching = false;
          });
        }
        else {
          this.navCtrl.navigateBack("/docteur_coach/home/patient-list");
        }
      }
    }, err => {
      this.navCtrl.navigateBack("/docteur_coach/home/patient-list");
    });
  }
}
