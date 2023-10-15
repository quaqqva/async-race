import Controller from './controller/controller';
import EventEmitter from '../utils/event-emitter';
import AppView from './view/app-view';
import AppViews from './view/app-views';

export type AppConfig = {
  title: string;
  connection: {
    url: string;
  };
};
export class App {
  view: AppView;

  controller: Controller;

  emitter: EventEmitter;

  public constructor(config: AppConfig) {
    this.emitter = new EventEmitter();
    this.view = new AppView({ appTitle: config.title, emitter: this.emitter });
    this.controller = new Controller(this.view, this.emitter, config.connection.url);
  }

  public async start(): Promise<void> {
    this.view.switchTo(AppViews.GarageView);
    this.controller.loadPage(1);
  }
}
