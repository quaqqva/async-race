import DOMComponent from '../../../../components/base-component';
import { PageLoadRequestData } from '../../../../types/app-interfaces';
import EventEmitter from '../../../../utils/event-emitter';
import AppEvents from '../../../app-events';
import { CarFullData } from '../../../model/car-full';
import SectionView from '../section-view';
import WinnersTable from './winners-table';

export default class WinnersView extends SectionView {
  private static CARS_PER_PAGE = 10;

  private table: WinnersTable;

  public constructor(emitter: EventEmitter, container: DOMComponent<HTMLElement>) {
    super(emitter, container);
    this.table = new WinnersTable(emitter, WinnersView.CARS_PER_PAGE);
    this.addEventHandlers();
  }

  public get carsPerPage(): number {
    return WinnersView.CARS_PER_PAGE;
  }

  public get addDelay(): number {
    return WinnersTable.PAGE_TRANSITION;
  }

  public override get height(): number {
    if (this.table.fullHeight) {
      const offset = 10; // I am very sorry I don't know what to do
      return this.table.fullHeight + this.navigation.fullHeight + this.pageTitle.fullHeight + offset;
    }
    return 0;
  }

  protected drawCars(cars: CarFullData[]): void {
    this.table.addCars(cars, this.currentPage);
  }

  protected alertNoData(): void {
    this.table.destroy();
    super.alertNoData();
  }

  protected removeNoDataMessage(): void {
    super.removeNoDataMessage();
    this.container.append(this.table);
  }

  public override requestPage(): void {
    const requestData: PageLoadRequestData = {
      page: this.currentPage,
      order: this.table.sortOrder,
      criteria: this.table.sortCriteria,
    };
    this.emitter.emit(AppEvents.PageLoad, requestData);
  }

  private addEventHandlers(): void {
    const handlers = {
      [AppEvents.WinnersSort]: () => this.requestPage(),
      [AppEvents.NoConnection]: () => this.alertNoData(),
    };
    this.emitter.addHandlers(handlers);
  }
}
