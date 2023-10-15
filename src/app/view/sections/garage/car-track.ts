import DOMComponent, { ElementParameters } from '../../../../components/base-component';
import { Car } from '../../../model/car';
import trackSprite from '../../../../assets/img/track_sprite.svg';
import SVGComponent from '../../../../components/svg-component';
import { Events, Tags } from '../../../../types/dom-types';
import Menu from '../../../../components/menu/menu';
import FontAwesome from '../../../../types/font-awesome';
import EventEmitter from '../../../../utils/event-emitter';
import SubmitCarModal from './submit-car-modal';
import ConfirmModal from '../../../../components/modals/confirm-modal';
import AppEvents from '../../../app-events';
import { DriveData, EngineStatus } from '../../../model/drive';
import CarImage from '../../car';
import { EngineRequestData, UpdateWinnerRequestData } from '../../../../types/app-interfaces';

enum TrackElements {
  Track = 'track',
  CarWrapper = 'track__car-wrapper',
  CarSVG = 'track__car',
  Flag = 'track__flag',
  Title = 'track__title',
  CarMenu = 'track__menu',
  UpdateButton = 'track__update-car',
  DeleteButton = 'track__delete-car',
  StartButton = 'track__start-engine',
  BreakButton = 'track__reset-car',
}

export default class Track extends DOMComponent<HTMLDivElement> {
  private static TRACK_PARAMS: ElementParameters = {
    classes: [TrackElements.Track],
  };

  private static TITLE_PARAMS: ElementParameters = {
    tag: Tags.Span,
    classes: [TrackElements.Title],
  };

  private static MENU_PARAMS: ElementParameters = {
    classes: [TrackElements.CarMenu],
  };

  private static START_BUTTON_INDEX = 2;

  private static STOP_BUTTON_INDEX = 3;

  private static DELETE_ICON_PARAMS: ElementParameters = {
    tag: Tags.Icon,
    classes: [FontAwesome.Solid, FontAwesome.Times],
  };

  private static CAR_COLOR_VAR = '--car-color'; // for CSS

  private static WIN_TIME_DECIMAL_DIGITS = 2;

  private static MAX_TRAVEL_TIME = 10;

  private emitter: EventEmitter;

  private carImage: CarImage;

  private flagSVG: SVGComponent;

  private carTitle: DOMComponent<HTMLSpanElement>;

  private car: Car;

  private engineStatus: EngineStatus;

  private menu: Menu;

  private isRacing: boolean;

  private startTime: number;

  public constructor(emitter: EventEmitter, car: Car) {
    super(Track.TRACK_PARAMS);
    this.emitter = emitter;
    this.isRacing = false;

    this.carImage = new CarImage(car.name);
    this.carImage.setColor(car.color);
    this.append(this.carImage);

    this.flagSVG = new SVGComponent({ pathToSprite: trackSprite, id: 'finish-flag', parent: this });
    this.flagSVG.addClass(TrackElements.Flag);

    this.carTitle = new DOMComponent({ ...Track.TITLE_PARAMS, textContent: car.name, parent: this });

    this.car = car;
    this.engineStatus = EngineStatus.Stopped;

    this.menu = this.createMenu();
    this.disableStopButton();

    this.startTime = 0;
  }

  public get isDriving(): boolean {
    return this.engineStatus === EngineStatus.Started;
  }

  public updateCar(car: Car): void {
    if (this.car.name !== car.name) {
      this.carImage.destroy();
      this.carImage = new CarImage(car.name);
      this.append(this.carImage);
    }
    this.carImage.setColor(car.color);

    this.car = car;
    this.carTitle.textContent = car.name;

    this.menu.getButton(Track.START_BUTTON_INDEX).setCSSProperty(Track.CAR_COLOR_VAR, car.color);
  }

  public startEngine(isRace: boolean): void {
    this.isRacing = isRace;
    this.menu.disableButton(Track.START_BUTTON_INDEX);

    const requestData: EngineRequestData = {
      id: this.car.id,
      engineStatus: EngineStatus.Started,
    };
    this.emitter.emit(AppEvents.CarToggleEngine, requestData);
    this.startTime = Date.now();
  }

  public launchCar(driveData: DriveData): void {
    if (!this.isRacing) this.menu.enableButton(Track.STOP_BUTTON_INDEX);

    this.engineStatus = EngineStatus.Started;
    const travelTime: number = driveData.distance / driveData.velocity;

    this.emitter.emit(AppEvents.RequestCarDrive, this.car.id);

    this.carImage.launchCar(travelTime);

    if (this.isRacing) {
      const finishHandler = () => {
        if (this.engineStatus !== EngineStatus.Stopped) {
          const finishTime = Date.now();
          const timeResult = Math.min(Track.MAX_TRAVEL_TIME, (finishTime - this.startTime) / 1000);
          const time = +timeResult.toFixed(Track.WIN_TIME_DECIMAL_DIGITS);

          const requestData: UpdateWinnerRequestData = { car: this.car, time };
          this.emitter.emit(AppEvents.CarFinished, requestData);
        } else this.emitter.emit(AppEvents.CarBroke, null);
        this.carImage.removeEventListener(Events.AnimationEnd, finishHandler);
      };
      this.carImage.addEventListener(Events.AnimationEnd, finishHandler);
    }
  }

  public stopEngine(): void {
    this.disableStopButton();

    const requestData: EngineRequestData = { id: this.car.id, engineStatus: EngineStatus.Stopped };
    this.emitter.emit(AppEvents.CarToggleEngine, requestData);
  }

  public resetCar(): void {
    this.carImage.reset();

    setTimeout(() => {
      this.menu.enableButton(Track.START_BUTTON_INDEX);
      this.engineStatus = EngineStatus.Stopped;
      this.emitter.emit(AppEvents.CarImageReset, null);
    }, CarImage.RESET_DURATION);
  }

  public stopCar(): void {
    if (this.engineStatus !== EngineStatus.Stopped && !this.carImage.isReseting) {
      this.engineStatus = EngineStatus.Stopped;
      this.carImage.stop();
    }
  }

  public disableStopButton(): void {
    this.menu.disableButton(Track.STOP_BUTTON_INDEX);
  }

  private createMenu(): Menu {
    const menu = new Menu({
      params: { ...Track.MENU_PARAMS, parent: this },
      buttonTexts: ['update', '', 'a', 'b'],
      buttonClasses: [
        TrackElements.UpdateButton,
        TrackElements.DeleteButton,
        TrackElements.StartButton,
        TrackElements.BreakButton,
      ],
      clickHandlers: [
        () => this.changeCar(),
        () => this.deleteCar(),
        () => this.startEngine(false),
        () => this.stopEngine(),
      ],
    });

    const deleteButtonIndex = 1;
    menu.getButton(deleteButtonIndex).append(new DOMComponent<HTMLElement>(Track.DELETE_ICON_PARAMS));

    const startButtonIndex = 2;
    menu.getButton(startButtonIndex).setCSSProperty(Track.CAR_COLOR_VAR, this.car.color);
    return menu;
  }

  private changeCar(): void {
    const modal = new SubmitCarModal(this.emitter, this.car);
    modal.show();
  }

  private deleteCar(): void {
    const deleteText = `Are you sure you want to delete ${this.car.name}?`;
    const confirmModal = new ConfirmModal({
      params: {},
      info: deleteText,
      yesCallback: () => {
        this.emitter.emit(AppEvents.CarDelete, this.car.id);
      },
      noCallback: () => {},
    });
    confirmModal.show();
  }
}
