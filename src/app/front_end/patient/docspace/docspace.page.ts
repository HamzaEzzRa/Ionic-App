import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, NavController } from '@ionic/angular';
import { Specialities } from './../../../selectionList';
import { DoctorCoach } from './doctor-coach.model';
import { AuthService } from './../../../auth/auth.service';
import { RequestManagerService } from './../request-manager.service';

@Component({
  selector: 'app-docspace',
  templateUrl: './docspace.page.html',
  styleUrls: ['./docspace.page.scss'],
})
export class DocspacePage implements OnInit {

  public isFetching: boolean = true;

  //le docteur ou coach auquel on va envoyer la demande
  public requestToDoctorCoach  = {
    lastName: undefined,
    firstName: undefined,
    role: undefined,
    specialty: undefined,
    birthday: undefined
  };

  //l'id du patient
  public patient_id;

  //la date actuelle
  public currentDate: string = new Date().toISOString();

  //liste des specialités des docteurs
  public doctorSpecialities = Specialities.doctor; 

  //liste des specialités des medecins
  public coachSpecialities = Specialities.coach;

 //la liste des medecins et coachs
 public doctorCoachList: DoctorCoach[] = [];

 //variable qui controle l'affichage de la barre de recherche
 public searchBarShown: boolean = false;

 //variable qui controle l'affichage de champ saisie d'un nouveau doctorCoach qui sera ajoute
 public adddoctorCoachShown: boolean = false;

 //liste des doctorCoachs selectionnes
 public doctorCoachListSelected: boolean[] = [false];

 //variable qui controle l'affichage des checkBox
 public checkZone: boolean = false;

 //variable qui controle le cochage ou nn de tous les checkBox 
 public checkAll: boolean = false;

 //le contenu de la barre de recherche
 public searchBarValue = '';


 //la valeur de routerLink
 public checkBoxWithRouter;

 public birthdayDateForm;

 /*
    la variable qui controle si le patient a choisit 
    de voir la liste des docteurs qui ont confirmés
    ou la liste des demandes en attente
*/
 public confirmedDoctorList = true;

 public showDoctorOrCoachSpecialities;
 
 public doctorOrCoachSpeciality;

 public messageError: string;

 constructor(
  private authService: AuthService,
  private requestManager: RequestManagerService,
  private alertController: AlertController,
  private toastController: ToastController,
  private navCtrl: NavController,
  private route: ActivatedRoute,
  private router: Router
  ) { }
 
  ngOnInit() {

  }

  ionViewWillEnter() {
    this.confirmedDoctorList = true;
    this.isFetching = true;

   /*
   this.http.get(
     environment.apiUrl + `/patient/dcList/${this.authService.userId}`, { 
       responseType: 'json'
      })
   .pipe(map(responseData => {
     console.log(responseData)


       return responseData['dcList'];
   }))*/
    this.requestManager.getDoctorCoachList().subscribe(doctor_coachListResponse => {
      console.log(doctor_coachListResponse);
      this.doctorCoachList = doctor_coachListResponse;
      this.checkBoxWithRouter = 'ordonnance';
      this.isFetching = false;
    });
 }

 async presentAlertConfirm() {
   //si aucun docteur ou coach n'est selectionner, on affiche une alerte 
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
           }
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
              this.onSubmitDeleteDC(); 
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

 async presentToast() {
  const toast = await this.toastController.create({
    message: this.messageError,
    duration: 4000
  });
  toast.present();
}
 

addDoctorCoach(nom: string, prenom: string, profession: string, specialite: string, dateNaissance: string) {
   this.doctorCoachList.unshift(
     {
        dc: {
          profile: {
              firstName: nom,
              lastName: prenom,
              birthday: dateNaissance,
              sex: undefined,
              specialty: specialite,
              phoneNumber: undefined,
              country: undefined,
              imagePath: undefined
          },
          _id: undefined,
          email: undefined,
          role: profession,
          geolocation: {
              address: undefined,
              staticMapImageUrl: undefined
          }
        },
        confirmed: false
    })
   this.adddoctorCoachShown = false;
 }

change(checked, doctorCoachIndex) {
  this.doctorCoachListSelected[doctorCoachIndex] = checked;
}

 supprimerdoctorCoachs() {
   for(var i = 0; i < this.doctorCoachListSelected.length; i++) {
     if(this.doctorCoachListSelected[i] == true) {
       this.doctorCoachListSelected.splice(i, 1);
       this.doctorCoachList.splice(i, 1);
       i--;
     }
   }

   //apres suppression de toute la liste on n'affiche pas selectionner tout
   if(!this.atLeastOneConfirmed()) {
     this.checkZone = false;
     this.checkAll = false;
   }
 }

 isChecked() {
   return this.doctorCoachListSelected.find(element => element === true);
 }

  atLeastOneConfirmed() {

    return this.doctorCoachList.find(element => {
      return element.confirmed == true;
    }
  )
  /*
   for(var i = 0; i < this.doctorCoachList.length; i++) {
     if(this.doctorCoachList[i].confirmed)
      return true;
   }
   return false;
   */
 }

  change_doctorId(id: string, firstName: string, lastName: string) {
    this.authService.otherId= id;
    if (!this.checkZone) {
      const relativeRoute = this.router.createUrlTree([firstName, lastName], {
      relativeTo: this.route
    });
    
    this.navCtrl.navigateForward(relativeRoute);
  }
 }

 onSubmit() {

  this.requestToDoctorCoach.birthday = this.requestToDoctorCoach.birthday.substr(0, 10);

  /*
    tester si le docteur ou coach qu'on veut lui envoyer la demande n'existe pas dans la liste
  */

  if(this.doctorCoachList.find( element => {
    if (!element.dc) {
      return;
    }
    return ( element.dc.profile.lastName == this.requestToDoctorCoach.lastName &&
      element.dc.profile.firstName == this.requestToDoctorCoach.firstName && 
      element.dc.profile.birthday == this.requestToDoctorCoach.birthday && 
      element.dc.profile.specialty == this.requestToDoctorCoach.specialty &&
      element.dc.role == this.requestToDoctorCoach.role
    )
  }) != undefined) {
    this.messageError = 'The doctor or coach already exists';
    this.presentToast();
    return;
  }  

  console.log(this.requestToDoctorCoach);

  /*
  this.http.post(
    environment.apiUrl + '/patient/patientRequest', {
      id: this.authService.userId,
      dc: this.requestToDoctorCoach
    }
  )*/
  
  this.requestManager.addPatientRequest(this.requestToDoctorCoach)
  .subscribe(response => {
    console.log(response); 

    this.addDoctorCoach(this.requestToDoctorCoach.firstName, 
      this.requestToDoctorCoach.lastName, this.requestToDoctorCoach.role,
      this.requestToDoctorCoach.specialty, this.requestToDoctorCoach.birthday);
    this.messageError = "The request has been sent successfully. Waiting for the " + this.requestToDoctorCoach.role + " confirmation!"
    this.presentToast();

  }, error => {
    this.messageError = "The doctor or coach doesn't exist";
    this.presentToast();
  })
 }

 onSubmitDeleteDC() {

  let idPatientListChecked: string[] = [];

  for(let i = 0; i < this.doctorCoachListSelected.length; i++) {
    if(this.doctorCoachListSelected[i]) {
      idPatientListChecked.push(this.doctorCoachList[i].dc._id);
    }
  }

  console.log(idPatientListChecked);

  /*
  this.http.post(
    environment.apiUrl + `/${this.authService.role}/dcDelete`, {
      id: this.authService.userId,
      dcIdList: idPatientListChecked
  })*/
  
  this.requestManager.deleteDoctorsCoaches(idPatientListChecked).subscribe(response => {
    console.log(response);

   
    this.supprimerdoctorCoachs();
  }, error => {
    console.log(error);
  })
}  

}
