import {
  EngineRequestData,
  PageLoadRequestData,
  UpdateWinnerRequestData,
  EngineResponseData,
  CarDriveResponseData,
  CarDeleteResponseData,
} from '../../types/app-interfaces';
import EventEmitter from '../../utils/event-emitter';
import AppEvents from '../app-events';
import { Car, CarViewData } from '../model/car';
import CarDatabase from '../model/car-database';
import { CarFullData } from '../model/car-full';
import { EngineStatus } from '../model/drive';
import { WinnersSortOrder, WinnersSortCriteria } from '../model/winner';
import AppView from '../view/app-view';
import AppViews from '../view/app-views';

export default class Controller {
  private emitter: EventEmitter;

  private database: CarDatabase;

  private view: AppView;

  private connectionEstablished: boolean;

  public constructor(view: AppView, emitter: EventEmitter, connectionUrl: string) {
    this.emitter = emitter;
    this.view = view;
    this.database = new CarDatabase(connectionUrl);
    this.addEventHandlers();
    this.connectionEstablished = true;
  }

  private addEventHandlers(): void {
    const handlers = {
      [AppEvents.SwitchView]: () => {
        this.switchView();
      },
      [AppEvents.CarCreate]: async (carViewData: unknown) => {
        try {
          const car = await this.database.createCar(carViewData as CarViewData);
          this.emitter.emit(AppEvents.CarCreated, car);
        } catch {
          this.onConnectionFail();
        }
      },
      [AppEvents.CarUpdate]: async (carData: unknown) => {
        const updatedCar = await this.database.updateCar(carData as Car);
        this.emitter.emit(AppEvents.CarUpdated, updatedCar);
      },
      [AppEvents.CarDelete]: async (carId: unknown) => this.onCarDelete(carId as number),
      [AppEvents.PageLoad]: async (pageData: unknown) => {
        const { page, order, criteria } = pageData as PageLoadRequestData;
        this.loadPage(page, criteria, order);
      },
      [AppEvents.GenerateCars]: async (carsCount: unknown) => {
        try {
          await this.database.createRandomCars(carsCount as number);
          this.emitter.emit(AppEvents.CarsGenerated, null);
        } catch {
          this.onConnectionFail();
        }
      },
      [AppEvents.CarToggleEngine]: async (requestData: unknown) =>
        this.onEngineToggle(requestData as EngineRequestData),
      [AppEvents.RequestCarDrive]: async (id: unknown) => this.onDriveRequest(id as number),
      [AppEvents.UpdateWinner]: async (carData: unknown) => this.onWinnerUpdate(carData as UpdateWinnerRequestData),
      [AppEvents.RequestTotalCars]: async () => this.onTotalCarsRequest(),
    };
    this.emitter.addHandlers(handlers);
  }

  public async loadPage(pageNumber: number, criteria?: WinnersSortCriteria, order?: WinnersSortOrder): Promise<void> {
    try {
      if (this.view.currentSection === AppViews.GarageView) {
        const carsPage = await this.database.getCars({ pageNum: pageNumber, carsPerPage: this.view.carsPerPage });
        this.view.drawCars(carsPage as CarFullData[]);
      } else {
        const winnersPage = await this.database.getWinners({
          pageNum: pageNumber,
          winnersPerPage: this.view.carsPerPage,
          sortOrder: order,
          sortBy: criteria,
        });
        this.view.drawCars(winnersPage);
      }
    } catch {
      this.onConnectionFail();
    }
  }

  private async onCarDelete(carId: number) {
    await this.database.deleteCar(carId);
    const replace = (
      await this.database.getCars({ pageNum: this.view.currentPage, carsPerPage: this.view.carsPerPage })
    ).at(-1);
    const response: CarDeleteResponseData = { id: carId, replace };

    try {
      await this.database.deleteWinner(carId);
    } catch {
      return;
    } finally {
      this.emitter.emit(AppEvents.CarDeleted, response);
    }
  }

  private async onDriveRequest(id: number) {
    try {
      const isDriving = await this.database.switchToDrive(id as number);
      const response: CarDriveResponseData = { id, isDriving };
      this.emitter.emit(AppEvents.ResponseCarDrive, response);
    } catch {
      this.emitter.emit(AppEvents.ResponseCarDrive, null);
    }
  }

  private async onEngineToggle(requestData: EngineRequestData) {
    const { id, engineStatus } = requestData as {
      id: number;
      engineStatus: EngineStatus.Started | EngineStatus.Stopped;
    };
    const driveData = await this.database.toggleEngine({ carId: id, engineStatus });
    const response: EngineResponseData = { id, engineStatus, driveData };
    this.emitter.emit(AppEvents.CarEngineToggled, response);
  }

  private async onWinnerUpdate(carData: UpdateWinnerRequestData): Promise<void> {
    const { car, time } = carData;
    try {
      await this.database.updateWinner({ id: car.id, time });
    } catch {
      await this.database.createWinner({ id: car.id, wins: 1, time });
    }

    if (this.view.currentSection === AppViews.WinnersView) this.loadPage(this.view.currentPage);
  }

  private async onTotalCarsRequest(): Promise<void> {
    try {
      if (this.view.currentSection === AppViews.GarageView) {
        const garageCarCount = await this.database.getCarsCount();
        this.emitter.emit(AppEvents.ResponseTotalCars, garageCarCount);
      } else {
        const winnersCarCount = await this.database.getWinnersCount();
        this.emitter.emit(AppEvents.ResponseTotalCars, winnersCarCount);
      }
    } catch {
      this.onConnectionFail();
    }
  }

  private onConnectionFail(forceEmit = false): void {
    if (this.connectionEstablished || forceEmit) {
      this.emitter.emit(AppEvents.NoConnection, this.connectionEstablished);
      this.connectionEstablished = false;
    }
  }

  private switchView(): void {
    const newView = this.view.currentSection === AppViews.GarageView ? AppViews.WinnersView : AppViews.GarageView;
    this.view.switchTo(newView);
    if (!this.connectionEstablished) this.onConnectionFail(true);
  }
}
