
//classe responsable des differents test de mesures issues des differents type de capteurs
export class TestSensorData {
  
    temperatureTest(temperature) {
      if(temperature >= 36.1 && temperature <= 37.5) return 'normale';
      if(temperature < 36.1) return 'basse';
      if(temperature > 37.5 && temperature < 37.8) return 'elevee';
      if(temperature > 37.8) return 'fièvre';
      
    }
  
    glycemieTest(glucose: number) {
      if (glucose < 0.7) return "Hypogyclemie";
      if (glucose <= 1 && glucose >= 0.7) return "normale";
      if (glucose <= 1.25 && glucose >= 1) return "Hypeglycemie moderee";
      if (glucose >= 1.26) return "diabète";
    }
  
    hyperTensionTest(hyperTension: number) {
      if(hyperTension < 10.7) return 'basse';
      if(107 <= hyperTension && hyperTension <= 120) return 'optimale';
      if(110 <= hyperTension && hyperTension <= 129) return 'normale';
      if(130 <= hyperTension && hyperTension <= 139) return 'normale haute';
      if(140 <= hyperTension && hyperTension <= 159) return 'hypertension legère';
      if(160 <= hyperTension && hyperTension <= 179) return 'hypertension moderee';
      if(180 <= hyperTension && hyperTension <= 209) return 'hypertension sevère';
      if( 209 < hyperTension) return 'hypertension tres sevère';
    }
  
    oxygenationTest(oxygenation: number) {
      if(oxygenation == null) return undefined;
      if (oxygenation < 95) return "saturation insuffisante";
      if(oxygenation >= 95  && oxygenation <= 100) return "saturation normale";
    }
  
    heartBeatsTest(heartBeats: number) {
      if(heartBeats < 60) return 'faible';
      if(heartBeats >= 60 && heartBeats <= 100) return 'normal';
      if(heartBeats > 100 && heartBeats <= 120) return 'rapide';
      if(heartBeats > 120) return 'dangeureux';
    }
  
    stepsTest(steps: number) {
      if(steps < 5000) return 'sedentaire';
      if(steps >= 5000 && steps <= 7499) return 'faiblement actif';
      if(steps > 7499 && steps <= 9999) return 'moderement actif';
      if(steps > 9999 && steps <= 12499) return 'actif';
      if(steps > 12500) return 'très actif';
    }
  
  }