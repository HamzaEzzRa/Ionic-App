// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: "http://healthappdemo-env.eba-pgtgx6bs.us-east-2.elasticbeanstalk.com/api", // YOUR_SERVER_URL_HERE
  googleMapsApiKey: 'AIzaSyBB87HagX5QZmlox-pzO5Iv4zheNuO2Nvg', // YOUR_MAPS_API_KEY_HERE
  googleProjectNumber: "1045321711077", // YOUR_GOOGLE_PROJECT_NUMBER_HERE
  appId: "4d85abb8-80b5-45e4-aaec-d803ccebc7da" // YOUR_APP_ID_HERE
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
