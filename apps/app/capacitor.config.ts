/// <reference types="@capacitor-firebase/authentication" />
/// <reference types="@capacitor/cli" />

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.jamma.coffeelounge",
  appName: "The Coffee Lounge App",
  webDir: "dist",
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    }
  },
  // server: {
  //   androidScheme: "http",
  //   url: "http://172.19.144.1:5173",
  //   cleartext: true
  // }
};

export default config;
