import DOMComponent, { ElementParameters } from '../../../../components/base-component';
import TableComponent from '../../../../components/table-component';
import { Events, Tags } from '../../../../types/dom-types';
import FontAwesome from '../../../../types/font-awesome';
import EventEmitter from '../../../../utils/event-emitter';
import AppEvents from '../../../app-events';
import { CarFullData } from '../../../model/car-full';
import { WinnersSortCriteria, WinnersSortOrder } from '../../../model/winner';
import CarImage from '../../car';

enum WinnersTableElements {
  Table = 'winners-table',
  TableHidden = 'winners-table_hidden',
  SortButton = 'winners-table__sort',
}
export default class WinnersTable extends TableComponent {
  public static PAGE_TRANSITION = 150;

  private static COLUMN_NAMES = ['number', 'car', 'name', 'wins', 'best time (s)'];

  private static SORT_BUTTON_PARAMS: ElementParameters = {
    tag: Tags.Button,
    classes: [WinnersTableElements.SortButton],
  };

  private carsPerPage: number;

  public sortOrder: WinnersSortOrder;

  public sortCriteria: WinnersSortCriteria;

  private emitter: EventEmitter;

  public constructor(emitter: EventEmitter, carsPerPage: number) {
    super(WinnersTable.COLUMN_NAMES);
    this.addClass(WinnersTableElements.Table);
    this.carsPerPage = carsPerPage;

    this.emitter = emitter;

    this.sortOrder = WinnersSortOrder.Descending;
    this.sortCriteria = WinnersSortCriteria.Wins;
    this.addSortButtons();
  }

  public addCars(cars: CarFullData[], pageNum: number) {
    this.addClass(WinnersTableElements.TableHidden);
    setTimeout(() => {
      this.clearRows();

      const startNumber = (pageNum - 1) * this.carsPerPage + 1;
      cars.forEach((car, index) => {
        const carImage = new CarImage(car.name);
        carImage.setColor(car.color);

        const row = [(startNumber + index).toString(), carImage, car.name, car.wins.toString(), car.time.toString()];
        this.addRow(row);
      });
      this.removeClass(WinnersTableElements.TableHidden);
    }, WinnersTable.PAGE_TRANSITION);
  }

  private addSortButtons(): void {
    const winsHeader = this.headElements[3];

    const sortWinsButton = this.createSortButton();
    sortWinsButton.addEventListener(Events.Click, () => this.changeSortCriteria(WinnersSortCriteria.Wins));
    winsHeader.append(sortWinsButton);

    const timeHeader = this.headElements[4];
    const sortTimeButton = this.createSortButton();
    sortTimeButton.addEventListener(Events.Click, () => this.changeSortCriteria(WinnersSortCriteria.Time));
    timeHeader.append(sortTimeButton);
  }

  private changeSortCriteria(criteria: WinnersSortCriteria): void {
    this.sortCriteria = criteria;
    this.switchSortOrder();
    this.emitter.emit(AppEvents.WinnersSort, null);
  }

  private createSortButton(): DOMComponent<HTMLButtonElement> {
    const sortButton = new DOMComponent<HTMLButtonElement>(WinnersTable.SORT_BUTTON_PARAMS);
    const sortIcon = new DOMComponent<HTMLElement>({
      tag: Tags.Icon,
      classes: [FontAwesome.Solid, FontAwesome.Sort],
    });
    sortButton.append(sortIcon);
    return sortButton;
  }

  private switchSortOrder(): void {
    this.sortOrder =
      this.sortOrder === WinnersSortOrder.Ascending ? WinnersSortOrder.Descending : WinnersSortOrder.Ascending;
  }
}
