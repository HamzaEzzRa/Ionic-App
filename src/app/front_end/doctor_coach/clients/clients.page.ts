import { Router, ActivatedRoute } from '@angular/router';
import { RequestManagerService } from './../request-manager.service';
import { Component, OnInit } from '@angular/core';
import { Patient } from './patient.model';
import { AuthService } from '../../../auth/auth.service';
import { AlertController, IonItemSliding, NavController } from '@ionic/angular';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage implements OnInit {

  public isFetching: boolean = true;

  public alertMessage;

  public doctor_coach_id;

  //la liste des patients
  public patientList: Patient[] = []; 

  //variable qui controle l'affichage de la barre de recherche
  public searchBarShown: boolean = false;

  //liste des patients selectionnes
  public patientListSelected: boolean[] = [false];

  //variable qui controle l'affichage des checkBox
  public checkZone: boolean = false;

  //variable qui controle le cochage ou nn de tous les checkBox 
  public checkAll: boolean = false;

  //le contenu de la barre de recherche
  public searchBarValue = '';

  //la valeur de routerLink
  public checkBoxWithRouter = 'patient-data';

  //liste des patients confirmés
  public confirmOrDemandList = true;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private requestManager: RequestManagerService,
    private router: Router,
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) { }
  
  ngOnInit() { }

  ionViewWillEnter() {
    this.isFetching = true;
    this.requestManager.getPatientList().subscribe(responsePatientList => {
      this.patientList = responsePatientList;
      console.log(this.patientList);
      this.isFetching = false;
    });
  }

  async acceptOrRejectPatientAlert(slide: IonItemSliding, patientIndex: number) 
  {
      const alert = await this.alertController.create({
        backdropDismiss: true,
        header: 'Warning',
        message: this.alertMessage,
        buttons: [
            {
              text: 'Yes',
              role: 'confirm',
              handler: () => {
                if(this.alertMessage == 'Please confirm your choice.')
                  this.acceptPatient(slide, patientIndex);
                else
                  this.rejectPatient(slide, patientIndex);
               },
            },
            {
              text: 'No',
              role: 'cancel'
            }
          ],
      });
      await alert.present();
  }
  
  change(checked, patientIndex) {
    this.patientListSelected[patientIndex] = checked;
  }

  supprimerPatients() {
    for(var i = 0; i < this.patientListSelected.length; i++)
    {
      if(this.patientListSelected[i] == true)
      {
        this.patientListSelected.splice(i, 1);
        this.patientList.splice(i, 1);
        i--;
      }
    }
    if(!this.atLeastOneConfirmed())
    {
      this.checkZone = false;
      this.checkAll = false;
    }
  }

  isChecked(): boolean {
    return this.patientListSelected.includes(true);
  }

  /*accepter la demande de patient en l'ajoutant dans la liste des 
    patients du docteur correspondant*/
  acceptRequest(patientIndex): void {
    this.patientList[patientIndex].confirmed = true;
    
    //this.patientList[patientIndex].adresse =  "lotissement 154 casa";
    //this.patientList[patientIndex].adresse_mail = "kopk@zegezg";
  }

  /*rejeter la demande de patient en le supprimant de la liste des 
  patients du docteur correspondant*/
  removeRequest(patientIndex): void {
    this.patientList.splice(patientIndex, 1);
  }

  atLeastOneConfirmed() {

    return this.patientList.find(element => {
      return element.confirmed == true;
    })

    /*
    for(var i = 0; i < this.patientList.length; i++) {
      if(this.patientList[i].confirmed)
        return true;
    }
    return false;
    */
  }

  changePatient_id(id: string, firstName: string, lastName: string) {
    this.authService.otherId = id;
    if (!this.checkZone) {
      const relativeRoute = this.router.createUrlTree([lastName, firstName], {
        relativeTo: this.route
      });
      this.navCtrl.navigateForward(relativeRoute);
    }
  }

  acceptPatient(slide: IonItemSliding, patientIndex: number) {
    console.log(patientIndex);
    this.requestManager.acceptPatientRequest(this.patientList, patientIndex).subscribe(response => {
      console.log(response);
    });


  
    this.acceptRequest(patientIndex);
    slide.close();
    slide.disabled=true;
  }

  rejectPatient(slide: IonItemSliding, patientIndex: number) {

    this.requestManager.rejectPatientRequest(this.patientList, patientIndex).subscribe(response => {
      console.log(response);

      this.removeRequest(patientIndex);
    }, error => {

      console.log(error);
    })
  
    slide.close();
  }


  async presentAlertConfirm() {
    if(!this.isChecked())
    {
      const alert = await this.alertController.create({
        backdropDismiss: true,
        header: 'Warning',
        message: "Select at least one element.",
        buttons: [
            {
              text: 'Ok',
              role: 'cancel',
              cssClass: 'danger',
            }, 
        ]
      });
      await alert.present();
    }
    else
    {
      const alert = await this.alertController.create({
        backdropDismiss: true,
        header: 'Warning',
        message: 'Are you sure ?',
        buttons: [
          {
            text: 'Yes',
            role: 'confirm',
            cssClass: 'danger',
            handler: () => {
              this.onSubmitDeletePatients();
            }
            
          },
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'danger',
            handler: () => {
              this.checkAll = false;
            }
          }
        ]
      });
      await alert.present();
    }
  }


  onSubmitDeletePatients() {

    let idPatientListChecked: string[] = [];

    for(let i = 0; i < this.patientListSelected.length; i++) {
      if(this.patientListSelected[i]) {
        idPatientListChecked.push(this.patientList[i].patient._id);
      }
    }

    console.log(idPatientListChecked);


    this.requestManager.deletePatient(idPatientListChecked).subscribe(response => {
      console.log(response);

      this.supprimerPatients();
    }, error => {
      console.log(error);
    });
  }
}
