import DOMComponent, { ElementParameters } from '../../../components/base-component';
import Menu from '../../../components/menu/menu';
import { PageLoadRequestData } from '../../../types/app-interfaces';
import { Tags } from '../../../types/dom-types';
import FontAwesome from '../../../types/font-awesome';
import EventEmitter from '../../../utils/event-emitter';
import AppEvents from '../../app-events';
import { CarFullData } from '../../model/car-full';

enum SectionElements {
  NoDataMessage = 'section__no-data',
  PageTitle = 'section__page-title',
  Navigation = 'section__navigation',
  NavigationButton = 'navigation__button',
}
export default abstract class SectionView {
  private static NO_DATA_PARAMS: ElementParameters = {
    tag: Tags.Heading2,
    classes: [SectionElements.NoDataMessage],
    textContent: 'No data avaliable',
  };

  private static PAGE_TITLE_PARAMS: ElementParameters = {
    tag: Tags.Heading2,
    classes: [SectionElements.PageTitle],
  };

  private static NAVIGATION_PARAMS: ElementParameters = {
    classes: [SectionElements.Navigation],
  };

  protected static LEFT_NAV_BUTTON_INDEX = 0;

  protected static RIGHT_NAV_BUTTON_INDEX = 1;

  private static BUTTON_ACTIVE_TRANSITION = 300;

  protected emitter: EventEmitter;

  protected container: DOMComponent<HTMLElement>;

  protected page: number;

  private noDataMessage: DOMComponent<HTMLHeadingElement>;

  protected pageTitle: DOMComponent<HTMLHeadingElement>;

  protected totalCarCount: number;

  public get section() {
    return this.container;
  }

  public abstract get carsPerPage(): number;

  protected navigation: Menu;

  public get currentPage(): number {
    return this.page;
  }

  public get height(): number {
    return this.container.height;
  }

  protected get totalPageCount(): number {
    return Math.ceil(this.totalCarCount / this.carsPerPage);
  }

  public constructor(emitter: EventEmitter, container: DOMComponent<HTMLElement>) {
    this.emitter = emitter;
    this.container = container;

    this.page = 1;
    this.totalCarCount = 0;
    this.navigation = this.createNavigation();

    this.noDataMessage = new DOMComponent<HTMLHeadingElement>(SectionView.NO_DATA_PARAMS);
    this.pageTitle = new DOMComponent<HTMLHeadingElement>({ ...SectionView.PAGE_TITLE_PARAMS, parent: this.container });
  }

  public drawData(cars: CarFullData[]): void {
    this.requestTotalCount();
    this.navigation.destroy();
    if (cars.length) {
      this.removeNoDataMessage();
      this.drawCars(cars);
      this.container.append(this.navigation);
    } else if (!this.totalCarCount) {
      this.navigation.destroy();
      this.alertNoData();
    } else {
      this.switchToPreviousPage();
    }
  }

  protected abstract drawCars(cars: CarFullData[]): void;

  protected requestPage(): void {
    const requestData: PageLoadRequestData = { page: this.currentPage };
    this.emitter.emit(AppEvents.PageLoad, requestData);
  }

  protected alertNoData(): void {
    this.pageTitle.textContent = '';
    this.container.append(this.noDataMessage);
  }

  protected removeNoDataMessage(): void {
    this.noDataMessage.destroy();
  }

  protected updatePageTitle(): void {
    if (this.totalCarCount)
      this.pageTitle.textContent = `Page ${this.page} of ${this.totalPageCount}\nTotal: ${this.totalCarCount} car${
        this.totalCarCount > 1 ? 's' : ''
      }`;
    else this.pageTitle.textContent = '';
  }

  private requestTotalCount(): void {
    const responseHandler = (count: unknown) => {
      this.totalCarCount = count as number;
      if (this.totalPageCount === 1) this.navigation.disableButton(SectionView.RIGHT_NAV_BUTTON_INDEX);
      else if (this.page !== this.totalPageCount) this.navigation.enableButton(SectionView.RIGHT_NAV_BUTTON_INDEX);

      this.updatePageTitle();
      this.emitter.unsubscribe(AppEvents.ResponseTotalCars, responseHandler);
    };
    this.emitter.subscribe(AppEvents.ResponseTotalCars, responseHandler);
    this.emitter.emit(AppEvents.RequestTotalCars, null);
  }

  protected switchToPreviousPage(): void {
    this.page -= 1;
    this.requestPage();

    if (this.page === 1) this.navigation.disableButton(SectionView.LEFT_NAV_BUTTON_INDEX);
    this.navigation.enableButton(SectionView.RIGHT_NAV_BUTTON_INDEX);
  }

  protected switchToNextPage(): void {
    this.page += 1;
    this.requestPage();

    if (this.page === this.totalPageCount) this.navigation.disableButton(SectionView.RIGHT_NAV_BUTTON_INDEX);
    this.navigation.enableButton(SectionView.LEFT_NAV_BUTTON_INDEX);
  }

  private createNavigation(): Menu {
    const menu = new Menu({
      params: SectionView.NAVIGATION_PARAMS,
      buttonTexts: ['', ''],
      clickHandlers: [
        () => setTimeout(() => this.switchToPreviousPage(), SectionView.BUTTON_ACTIVE_TRANSITION),
        () => setTimeout(() => this.switchToNextPage(), SectionView.BUTTON_ACTIVE_TRANSITION),
      ],
      buttonClasses: [SectionElements.NavigationButton, SectionElements.NavigationButton],
    });

    menu.disableButton(SectionView.LEFT_NAV_BUTTON_INDEX);

    const leftNavigationIcon = new DOMComponent<HTMLElement>({
      tag: Tags.Icon,
      classes: [FontAwesome.Solid, FontAwesome.LessThan],
    });
    menu.getButton(SectionView.LEFT_NAV_BUTTON_INDEX).append(leftNavigationIcon);

    const rightNavigationIcon = new DOMComponent<HTMLElement>({
      tag: Tags.Icon,
      classes: [FontAwesome.Solid, FontAwesome.GreaterThan],
    });
    menu.getButton(SectionView.RIGHT_NAV_BUTTON_INDEX).append(rightNavigationIcon);

    return menu;
  }
}
