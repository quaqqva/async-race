import DOMComponent, { ElementParameters } from '../../../../components/base-component';
import Menu from '../../../../components/menu/menu';
import InfoModal from '../../../../components/modals/info-modal';
import {
  CarDeleteResponseData,
  CarDriveResponseData,
  EngineResponseData,
  UpdateWinnerRequestData,
} from '../../../../types/app-interfaces';
import EventEmitter from '../../../../utils/event-emitter';
import { getMapKeys, getMapValues } from '../../../../utils/get-map-entries';
import AppEvents from '../../../app-events';
import { Car } from '../../../model/car';
import { EngineStatus } from '../../../model/drive';
import SectionView from '../section-view';
import Track from './car-track';
import SubmitCarModal from './submit-car-modal';

enum GarageClasses {
  GarageMenu = 'garage__menu',
  MenuAddButton = 'garage-menu__add',
  MenuGenerateButton = 'garage-menu__generate',
  MenuRaceButton = 'garage-menu__race',
  MenuResetButton = 'garage-menu__reset',
  TracksWrapper = 'garage__tracks',
  TracksWrapperHidden = 'garage__tracks_hidden',
}
export default class GarageView extends SectionView {
  private static MENU_PARAMS: ElementParameters = {
    classes: [GarageClasses.GarageMenu],
  };

  private static RANDOM_CARS_COUNT = 100;

  private static MENU_BUTTONS: string[] = ['Add new', `Generate ${GarageView.RANDOM_CARS_COUNT}`, 'Race', 'Reset'];

  private static RACE_BUTTON_INDEX = 2;

  private static RESET_BUTTON_INDEX = 3;

  private static TRACKS_WRAPPER_PARAMS: ElementParameters = {
    classes: [GarageClasses.TracksWrapper],
  };

  private static CARS_PER_PAGE = 7;

  private static OPACITY_TRANSITION = 150;

  private menu: Menu;

  private tracksWrapper: DOMComponent<HTMLDivElement>;

  private tracks: Map<number, Track>;

  private raceGoing: boolean;

  public constructor(emitter: EventEmitter, container: DOMComponent<HTMLElement>) {
    super(emitter, container);
    this.raceGoing = false;

    this.menu = this.createMenu();
    this.tracksWrapper = new DOMComponent<HTMLDivElement>({
      ...GarageView.TRACKS_WRAPPER_PARAMS,
      parent: this.container,
    });

    this.tracks = new Map();
    this.addEventHandlers();
  }

  public get carsPerPage(): number {
    return GarageView.CARS_PER_PAGE;
  }

  protected drawCars(cars: Car[]): void {
    if (this.raceGoing) this.resetRace();
    this.tracksWrapper.addClass(GarageClasses.TracksWrapperHidden);
    setTimeout(() => {
      this.tracksWrapper.clear();
      this.tracks.clear();

      cars.forEach((car) => {
        const track = new Track(this.emitter, car);
        this.tracks.set(car.id, track);
        this.tracksWrapper.append(track);
      });

      this.menu.enableButton(GarageView.RACE_BUTTON_INDEX);
      this.menu.enableButton(GarageView.RESET_BUTTON_INDEX);

      this.tracksWrapper.removeClass(GarageClasses.TracksWrapperHidden);
    }, GarageView.OPACITY_TRANSITION);
  }

  protected alertNoData(): void {
    this.tracksWrapper.destroy();
    super.alertNoData();
  }

  protected removeNoDataMessage(): void {
    super.removeNoDataMessage();
    this.container.append(this.tracksWrapper);
    this.container.append(this.navigation);
  }

  private addEventHandlers(): void {
    const handler = {
      [AppEvents.CarCreated]: (data: unknown) => {
        if (!this.totalCarCount) this.removeNoDataMessage();
        this.createCar(data as Car);
      },
      [AppEvents.CarUpdated]: (data: unknown) => {
        this.updateCar(data as Car);
      },
      [AppEvents.CarDeleted]: (data: unknown) => {
        this.deleteCar(data as CarDeleteResponseData);
      },
      [AppEvents.CarsGenerated]: () => {
        this.requestPage();
      },
      [AppEvents.CarToggleEngine]: () => {
        this.menu.disableButton(GarageView.RACE_BUTTON_INDEX);
      },
      [AppEvents.CarEngineToggled]: (data: unknown) => {
        const { id, engineStatus, driveData } = data as EngineResponseData;
        const track = this.tracks.get(id);
        if (engineStatus === EngineStatus.Started) {
          track?.launchCar(driveData);
        } else track?.resetCar();
      },
      [AppEvents.CarImageReset]: () => {
        if (getMapValues(this.tracks).every((trackElement) => !trackElement.isDriving)) {
          this.menu.enableButton(GarageView.RACE_BUTTON_INDEX);
          this.menu.enableButton(GarageView.RESET_BUTTON_INDEX);
        }
      },
      [AppEvents.ResponseCarDrive]: (data: unknown) => {
        if (!data) return;
        const { id, isDriving } = data as CarDriveResponseData;
        const carTrack = this.tracks.get(id);
        if (!isDriving && carTrack?.isDriving) carTrack?.stopCar();
      },
      [AppEvents.NoConnection]: (data: unknown) => {
        const firstTime = data as boolean;
        if (firstTime) {
          this.menu.forEachButton((_, index) => this.menu.disableButton(index));
          const infoModal = new InfoModal({
            params: {},
            info: 'Connection not established, try page reload',
          });
          infoModal.show();
          this.alertNoData();
        }
      },
    };
    this.emitter.addHandlers(handler);
  }

  private createMenu(): Menu {
    const params: ElementParameters = {
      ...GarageView.MENU_PARAMS,
      parent: this.container,
    };

    const clickHandlers = [
      () => {
        const inputModal = new SubmitCarModal(this.emitter);
        inputModal.show();
      },
      () => {
        this.emitter.emit(AppEvents.GenerateCars, GarageView.RANDOM_CARS_COUNT);
      },
      () => {
        this.launchRace();
      },
      () => {
        this.resetRace();
      },
    ];

    const menu = new Menu({
      params,
      buttonTexts: GarageView.MENU_BUTTONS,
      buttonClasses: [
        GarageClasses.MenuAddButton,
        GarageClasses.MenuGenerateButton,
        GarageClasses.MenuRaceButton,
        GarageClasses.MenuResetButton,
      ],
      clickHandlers,
    });
    return menu;
  }

  private createCar(car: Car): void {
    const ids = getMapKeys(this.tracks);

    if (ids.length < this.carsPerPage) {
      this.addTrack(car);
    } else if (ids.length === this.carsPerPage) this.navigation.enableButton(GarageView.RIGHT_NAV_BUTTON_INDEX);
    if (!ids.length) this.container.append(this.navigation);

    this.totalCarCount += 1;
    this.updatePageTitle();
  }

  private updateCar(car: Car): void {
    const carTrack = this.tracks.get(car.id);
    if (carTrack) carTrack.updateCar(car);
  }

  private deleteCar({ id, replace }: CarDeleteResponseData): void {
    const carsOnPage = getMapKeys(this.tracks).length;
    this.tracks.get(id)?.destroy();
    this.tracks.delete(id);

    if (carsOnPage === this.carsPerPage && replace) {
      this.addTrack(replace);
      if (this.page === this.totalPageCount - 1 && (this.totalCarCount - 1) % this.carsPerPage === 0) {
        this.navigation.disableButton(GarageView.RIGHT_NAV_BUTTON_INDEX);
      }
    } else if (carsOnPage === 1) {
      if (this.totalCarCount === 1) {
        this.alertNoData();
        this.navigation.destroy();
      } else {
        this.switchToPreviousPage();
        this.navigation.disableButton(GarageView.RIGHT_NAV_BUTTON_INDEX);
      }
    }
    this.totalCarCount -= 1;
    this.updatePageTitle();
  }

  private addTrack(car: Car): void {
    const newTrack = new Track(this.emitter, car);
    this.tracksWrapper.append(newTrack);
    this.tracks.set(car.id, newTrack);
  }

  private launchRace(): void {
    this.menu.disableButton(GarageView.RACE_BUTTON_INDEX);
    // this.menu.disableButton(GarageView.RESET_BUTTON_INDEX);

    this.tracks.forEach((track) => {
      track.startEngine(true);
      track.disableStopButton();
    });

    this.raceGoing = true;

    const firstFinishHandler = (carData: unknown) => {
      const { car, time } = carData as UpdateWinnerRequestData;
      const infoModal = new InfoModal({
        params: {},
        info: `${car.name} finished first in ${time}s!`,
      });
      this.emitter.emit(AppEvents.UpdateWinner, carData);
      infoModal.show();

      this.menu.enableButton(GarageView.RESET_BUTTON_INDEX);
      this.emitter.unsubscribe(AppEvents.CarFinished, firstFinishHandler);
    };
    this.emitter.subscribe(AppEvents.CarFinished, firstFinishHandler);

    let brokenCars = 0;
    const breakHandler = () => {
      brokenCars += 1;
      if (brokenCars === getMapKeys(this.tracks).length) {
        this.menu.enableButton(GarageView.RESET_BUTTON_INDEX);
        this.emitter.unsubscribe(AppEvents.CarBroke, breakHandler);
      }
    };
    this.emitter.subscribe(AppEvents.CarBroke, breakHandler);
  }

  private resetRace(): void {
    this.menu.disableButton(GarageView.RESET_BUTTON_INDEX);
    this.tracks.forEach((track) => {
      track.stopEngine();
    });
    this.raceGoing = false;
    this.emitter.unsubscriveEvery(AppEvents.CarFinished);
  }
}
