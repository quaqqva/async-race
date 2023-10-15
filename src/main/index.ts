import { App, AppConfig } from '../app/app';
import appConfig from './config.json';

const app = new App(appConfig as AppConfig);
app.start();
