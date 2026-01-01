import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moments.app',
  appName: 'Moments',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
      readyTimeout: 10000,
      resetWhenUpdate: false
    }
  },
  server: {
    androidScheme: 'https',
    hostname: 'com.moments.app',
    allowNavigation: [
      '*.puter.com',
      '*.puter.site'
    ]
  }
};

export default config;
