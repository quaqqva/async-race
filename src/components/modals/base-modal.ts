import { Events } from '../../types/dom-types';
import DOMComponent, { ElementParameters } from '../base-component';
import './modal-styles.scss';

enum ModalClasses {
  ModalElement = 'modal',
  ModalElementHidden = 'modal_hidden',
  ModalBackground = 'modal__background',
  ModalBackgroundHidden = 'modal__background_hidden',
}

export default class Modal extends DOMComponent<HTMLDivElement> {
  private static BG_PARAMS: ElementParameters = {
    classes: [ModalClasses.ModalBackground, ModalClasses.ModalBackgroundHidden],
  };

  private static TRANSITION_TIME_PROPERTY = '--modal-show-time';

  private static DEFAULT_TRANSITION = 500;

  private showTime: number;

  private parent: DOMComponent<HTMLElement>;

  private background: DOMComponent<HTMLDivElement>;

  public constructor(params: ElementParameters, showTime = Modal.DEFAULT_TRANSITION) {
    const newParams = structuredClone(params);
    const { parent } = newParams;
    delete newParams.parent;

    super(newParams);
    this.parent = parent || DOMComponent.fromElement(document.body);

    this.addClass(ModalClasses.ModalElement, ModalClasses.ModalElementHidden);
    this.showTime = showTime;
    this.setCSSProperty(Modal.TRANSITION_TIME_PROPERTY, `${this.showTime}ms`);

    this.background = new DOMComponent<HTMLDivElement>(Modal.BG_PARAMS);
    this.background.setCSSProperty(Modal.TRANSITION_TIME_PROPERTY, `${this.showTime}ms`);
    this.background.addEventListener(Events.Click, () => {
      this.hide();
    });
  }

  public show(): void {
    this.parent.setCSSProperty('overflow', 'hidden');
    this.parent.append(this.background, this);
    const scrolled = this.parent.isBody
      ? DOMComponent.fromElement(document.documentElement).scrolledY
      : this.parent.scrolledY;

    this.setCSSProperty('top', `${scrolled}px`);
    this.background.setCSSProperty('top', `${scrolled}px`);
    queueMicrotask(() => {
      this.removeClass(ModalClasses.ModalElementHidden);
      this.background.removeClass(ModalClasses.ModalBackgroundHidden);
    });
  }

  public hide(): void {
    this.addClass(ModalClasses.ModalElementHidden);
    this.background.addClass(ModalClasses.ModalBackgroundHidden);
    setTimeout(() => {
      this.destroy();
      this.background.destroy();
      this.parent.removeCSSProperty('overflow');
    }, this.showTime);
  }
}
