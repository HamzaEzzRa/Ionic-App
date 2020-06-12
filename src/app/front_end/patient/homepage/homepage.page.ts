import { HttpClient } from '@angular/common/http';
import { SimulationService, SampleSensorSent } from './simulation.service';
import { environment } from './../../../../environments/environment';
import { AuthService } from './../../../auth/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { RequestManagerService } from '../request-manager.service';
import { ToastController } from '@ionic/angular';
import { Toast } from './../../../toast.controller';
import { Plugins } from '@capacitor/core';
import { map } from'rxjs/operators';
import { Label } from 'ng2-charts';
import { GlobalSensor } from './diagram.model'
import { Line_Bar_Charts, Radar_PolarArea_Chart } from './diagram.class';
import { TestSensorData } from './testSensor.class';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.page.html',
  styleUrls: ['./homepage.page.scss'],
})
export class HomepagePage implements OnInit {

  @ViewChild("segment") segment: any;

  public sections = {
    first: "first",
    second: "second",
    selectedSection: "first"
  };

  public state = 'not-working';

  //l'id du patient
  public patient_id;

  //l'objet qui se charge de tester les donnees des differents capteurs
  public testSensorData: TestSensorData;

  //la date actuelle 
  public actualDate: Date;

  //le jour choisit, il est initie au jour actuel en debut, c'est un indice
  public day;

  /*
    les donnees issus du capteur de temperature sous forme d'objet contenant deux tableaux
    le premier represente les differentes prelevements de temperature et l'autre represente 
    leur temps de prelevement
    remarque: les indices des tableaux indique le jour de la semaine :
    0 -> dimanche, 
    1 -> lundi, 
    ....,
    6 -> samedi
  */
  public globalSensor: GlobalSensor = {};

  //le tableau contenant tous les donnees prelevees par les differents capteurs
  public globalData: number[][];

  //les labels du diagramme global
  public globalLabels: Label[];

  //les heures de prelevement des autres diagrammes pendant une semaine
  public labels : Label[][];

  //les heures du prelevement du jour actuel ou bien du jour choisit
  public currentDayLabels: Label[];

  //le diagramme global contenant toutes les differents donnees issus des differents capteurs
  public globalChart: Line_Bar_Charts;
  
  //le diagramme de temperature
  public temperatureChart: Line_Bar_Charts;

  //le diagramme de glucose
  public glucoseChart: Radar_PolarArea_Chart;

  //le diagramme de tension arterielle
  public hyperTensionChart: Line_Bar_Charts;
  
  //le diagramme d'oxygenation
  public oxygeneChart: Radar_PolarArea_Chart;
  
  /*
    variable contenant le nombre de pas par temps de prelevement initié au depart a la 
    premiere valeur preleve du jour actuel
  */
  public nombrePas: number;

  //tableau des differents prelevement de battement de coeur d'un jour
  public currentDayHeartBeats;

  //premier prelevement de battement de coeur dans le jour
  public HeartBeatsValue: number;

  //nombre de pas par jour
  public stepsPerDar: number = 0;

  public shouldIUnsubscribe = false;

  public sexForImg = 'm';

  private _originalWaitTime: number;

  private _timeoutView: string = "";

  private _timeLeft: number;

  private _percentage: number;

  interval: any;

  private _isFetching: boolean = false;

  showDiagrams: boolean = false;

  constructor(
    private requestManager: RequestManagerService,
    private authService: AuthService,
    private toastController: ToastController,
    private simulationService: SimulationService,
    private httpClient: HttpClient
  ) { }

  get isFetching() {
    return this._isFetching;
  }

  get timeoutView() {
    return this._timeoutView;
  }

  get timeLeft() {
    return this._timeLeft;
  }

  get percentage() {
    return this._percentage;
  }

  get originalWaitTime() {
    return this._originalWaitTime;
  }

  ngOnInit() {
    this._isFetching = true;
    this.actualDate = new Date();
    this.day = this.actualDate.getDay();
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    if (currentHour < 10) {
      const nextTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0, 0, 0);
      this._timeLeft = nextTime.getTime() - currentDate.getTime();
      this._originalWaitTime = 10 * 3600 * 1000;
      this._percentage = +((((this.originalWaitTime - this.timeLeft) / this.originalWaitTime) * 100).toFixed(2));
      const hours = Math.floor((this.timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((this.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((this.timeLeft % (1000 * 60)) / 1000);
      this._timeoutView = (hours < 10 ? "0" : "") + hours + " : " + (minutes < 10 ? "0" : "") + minutes + " : " + (seconds < 10 ? "0" : "") + seconds;
      this.createCountdown();
    }
    else {
      this.httpClient.get<{ message?: string, originalWaitTime?: number, waitTime?: number }>(environment.apiUrl + `/patient/sampleWaitTime/${this.authService.userId}`).subscribe(resData => {
        if (resData.waitTime) {
          this._timeLeft = resData.waitTime;
          this._originalWaitTime = resData.originalWaitTime;
          this._percentage = +((((this.originalWaitTime - this.timeLeft) / this.originalWaitTime) * 100).toFixed(2));
          const hours = Math.floor((this.timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((this.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((this.timeLeft % (1000 * 60)) / 1000);
          this._timeoutView = (hours < 10 ? "0" : "") + hours + " : " + (minutes < 10 ? "0" : "") + minutes + " : " + (seconds < 10 ? "0" : "") + seconds;
          this.createCountdown();
        }
        else {
          this._timeoutView = "Press to Take a Sample";
          this._percentage = 100;
        }
      }, err => {;
        console.log(err);
        this._timeoutView = "Unable to Take a Sample for Now"
        this._percentage = 0;
      });
    }
  }

  ionViewDidLeave() {
    this.showDiagrams = false;
  }

  ionViewWillEnter() {
    this._isFetching = true;
    let sub = this.requestManager.getPatientSensorData().pipe(map(responseData => {
      console.log(responseData);
      this.sexForImg = responseData['sex'];
      const mappedResponse = responseData['sensorData'];

      let responseDataLength = 0;
      for(const key in mappedResponse) {
        console.log(key);
        responseDataLength++;

        
        let responseDataNestedObjectLength = 0;
        for(const secondKey in mappedResponse[key]) {
          console.log(secondKey);
          responseDataNestedObjectLength++;
        }

        if(responseDataNestedObjectLength < 2) {
          this.shouldIUnsubscribe = true;
          break;
        }
        
          
      }
      
      if(responseDataLength < 7) {
        this.shouldIUnsubscribe = true;
        return;
      }
      else
        return mappedResponse;
      }
    )).subscribe(sensorData => {
      console.log(sensorData);
      if(this.shouldIUnsubscribe) {
        this.presentToast();
        sub.unsubscribe();
        return;
      }
      this.globalSensor = sensorData;

      for(let day = 0; day < this.globalSensor.dates.length; day++) {
        for(let time = 0; time < this.globalSensor.dates[day].length; time++) {
          this.globalSensor.dates[day][time] = this.globalSensor.dates[day][time].substring(11, 16);
        }
      }
    
      this.labels = this.globalSensor.dates;

      console.log(this.globalSensor);
      console.log(this.labels);

      this.testSensorData = new TestSensorData();
      
      this.nombrePas = this.globalSensor.steps.values[this.day][0];
      this.currentDayHeartBeats = this.globalSensor.heartbeat.values[this.day];
      this.HeartBeatsValue = this.currentDayHeartBeats[0];
      this.stepsPerDar = this.calculateTotalSteps();

      this.globalData = [
        this.globalSensor.temperature.values[this.day],
        this.globalSensor.glucose.values[this.day],
        this.globalSensor.bloodPressure.values[this.day],
        this.globalSensor.oxygen.values[this.day],
        this.globalSensor.heartbeat.values[this.day],
        this.globalSensor.steps.values[this.day],
      ];

      this.currentDayLabels = this.labels[this.day]


      console.log(this.currentDayLabels);

      this.globalChart = new Line_Bar_Charts("Global", this.globalData, [
          "temperature in C°", 
          "hypertension in mmHg", 
          "oxygen in %",
          "heartbeats in bmp", 
          "glucose in g/L", 
          "steps per day",
        ]
      );
      this.temperatureChart = new Line_Bar_Charts(
        "Temperature in C°", //son titre
        this.globalSensor.temperature.values[this.day] //les donnees des differents prelevements
      );
      this.glucoseChart = new Radar_PolarArea_Chart(
        "Glucose level in g/L",
        this.globalSensor.glucose.values[this.day]
      );

      this.hyperTensionChart = new Line_Bar_Charts(
        "Hyper tension in mmHg",
        this.globalSensor.bloodPressure.values[this.day]
      );

      this.oxygeneChart = new Radar_PolarArea_Chart(
        "Oxygenation in %",
        this.globalSensor.oxygen.values[this.day]
      );
      this.globalLabels = ["1","2","3","4"]
      this._isFetching = false;
    }, error => {
      this.presentToast();
      console.log(error);
    });
  }

  private createCountdown() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      const hours = Math.floor((this.timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((this.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((this.timeLeft % (1000 * 60)) / 1000);
      this._timeLeft -= 1000;
      // console.log(this.percentage + " %")
      this._percentage = +((((this.originalWaitTime - this.timeLeft) / this.originalWaitTime) * 100).toFixed(2));
      this._timeoutView = (hours < 10 ? "0" : "") + hours + " : " + (minutes < 10 ? "0" : "") + minutes + " : " + (seconds < 10 ? "0" : "") + seconds;
      if (this.timeLeft < 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  onSampleClick() {
    if (this.timeoutView == "Press to Take a Sample") {
      this.sample();
    }
  }

  sample() {
    if (!this.timeLeft) {
      this.simulationService.hasTakenSample = true;
      let sampleSensorSent: SampleSensorSent = this.simulationService.sampleSensorSentReturned();
        
      console.log(sampleSensorSent);

      /*
      this.http.post<{ waitTime?: number }>(environment.apiUrl + "/patient/sample", {
        id: this.authService.userId,
        sensorData: sampleSensorSent,
        normal: this.simulationService.normal
      })*/

      this.requestManager.setPatientSensorData(sampleSensorSent, this.simulationService.normal)
      .subscribe(resData => {
        clearInterval(this.interval);
        this._timeLeft = resData.waitTime * 3600 * 1000;
        this._originalWaitTime = resData.waitTime * 3600 * 1000;
        this._percentage = +((((this.originalWaitTime - this.timeLeft) / this.originalWaitTime) * 100).toFixed(2));
        const hours = Math.floor((this.timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((this.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((this.timeLeft % (1000 * 60)) / 1000);
        this._timeoutView = (hours < 10 ? "0" : "") + hours + " : " + (minutes < 10 ? "0" : "") + minutes + " : " + (seconds < 10 ? "0" : "") + seconds;
        this.createCountdown();
        const currentDate = new Date();

        this.sections.selectedSection = this.sections.second;
        const toastObject = new Toast(this.toastController);
        toastObject.presentToast('Your sample has been taken successfully.');

        Plugins.LocalNotifications.schedule({
          notifications: [
            {
              id: 8,
              title: "Sensor Sample Reminder",
              body: "The application is ready to take your sample. Please login and make sure your sensors are working.",
              schedule: { at: new Date(+currentDate + resData.waitTime * 3600 * 1000) }
            }
          ]
        });
        
      }, error => {
        console.log(error);
        const toastObject = new Toast(this.toastController);
        toastObject.presentToast('Your sample was not taken please check the state of your sensors or try later.');
      })
      this.simulationService.hasTakenSample = false;
    }
  }

  //modifier les donnes de tous les diagrammes en cas de changement de jour
  changeData(jour: number) {

    this.globalChart.setGlobalData([
      this.globalSensor.temperature.values[jour],
      this.globalSensor.bloodPressure.values[jour],
      this.globalSensor.oxygen.values[jour],
      this.globalSensor.heartbeat.values[jour],
      this.globalSensor.glucose.values[jour],
      this.globalSensor.steps.values[jour],
    ]);

    this.temperatureChart.setData(
      this.globalSensor.temperature.values[jour],
    );

    this.hyperTensionChart.setData(
      this.globalSensor.bloodPressure.values[jour],
    );

    this.oxygeneChart.setData(
      this.globalSensor.oxygen.values[jour],
    );

    this.glucoseChart.setData(
      this.globalSensor.glucose.values[jour],
    );
    
    this.HeartBeatsValue = this.globalSensor.heartbeat.values[jour][0];
    this.nombrePas = this.globalSensor.steps.values[jour][0];
    this.currentDayLabels = this.labels[jour];
  }

  //calcul du nombre total de pas dans le jour
  calculateTotalSteps() {

    var stepsTotalSum = 0;
    for(var i = 0; i < this.globalSensor.steps.values[this.day].length; i++)
      stepsTotalSum += this.globalSensor.steps.values[this.day][i];
    return stepsTotalSum;
  }

  //calcul du total de nombre de pas jusqu'au prelevement choisi
  displaySteps(prelevtime: number, jour: number) {
    var stepsSum = 0;
    for (var i = 0; i <= prelevtime; i++) stepsSum += this.globalSensor.steps.values[jour][i];
    this.nombrePas = stepsSum;
  }

  //mise a jour du nombre de pas en cas de changement de jour 
  displayHeartBeats(prelevTime: number, jour: string) {
    this.HeartBeatsValue = this.globalSensor.heartbeat.values[jour][prelevTime];
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'The data is not complete or have an incorrect form, checkout the server status and the database.',
      duration: 4000
    });
    toast.present();
  }

  public scrolling;

  endPointerEvent() {
    this.scrolling = true;
  }
}
