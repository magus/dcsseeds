const EnvConfig = {
  DEV: process.env.NODE_ENV !== 'production',
  APP_NAME: 'DCSS Search',
  PROTOCOL: 'https',
  HOSTNAME: 'dcss.vercel.app',
  GOOGLE_ANALYTICS_UA: 'G-LPJN02KFN1',
};

if (EnvConfig.DEV) {
  EnvConfig.PROTOCOL = 'http';
  EnvConfig.HOSTNAME = 'localhost:3000';
}

module.exports = EnvConfig;
