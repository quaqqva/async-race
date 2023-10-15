import { Tags } from '../../types/dom-types';
import DOMComponent, { ElementParameters } from '../base-component';
import './slider-styles.scss';

enum SliderClasses {
  SliderWrapper = 'slider-wrapper',
  Slider = 'slider',
  SliderElementHidden = 'slider__element_hidden',
}
export default class Slider extends DOMComponent<HTMLDivElement> {
  private static WRAPPER_PARAMS: ElementParameters = {
    tag: Tags.Div,
    classes: [SliderClasses.SliderWrapper],
  };

  private static SLIDER_PARAMS: ElementParameters = {
    tag: Tags.Div,
    classes: [SliderClasses.Slider],
  };

  private static DEFAULT_SLIDE_TIME = 300;

  private slideTime: number;

  private currentElementIndex: number;

  private components: DOMComponent<HTMLElement>[];

  public constructor({
    slideTime = Slider.DEFAULT_SLIDE_TIME,
    parent,
  }: {
    slideTime?: number;
    parent?: DOMComponent<HTMLElement>;
  }) {
    super(Slider.SLIDER_PARAMS);

    const wrapper = new DOMComponent<HTMLDivElement>({ ...Slider.WRAPPER_PARAMS, parent });
    wrapper.append(this);

    this.slideTime = slideTime;
    this.components = [];
    this.currentElementIndex = -1;
  }

  public get transitionTime(): number {
    return this.slideTime;
  }

  public override append(...elements: DOMComponent<HTMLElement>[]): void {
    super.append(...elements);
    this.components.push(...elements);

    if (this.currentElementIndex === -1) {
      this.currentElementIndex = 0;
      elements.shift();
    }
    elements.forEach((element) => element.addClass(SliderClasses.SliderElementHidden));
  }

  public override clear(): void {
    super.clear();
    this.currentElementIndex = -1;
  }

  public slideTo(component: DOMComponent<HTMLElement>): void {
    const currentElement = this.components[this.currentElementIndex];
    currentElement.addClass(SliderClasses.SliderElementHidden);

    const index = this.components.indexOf(component);
    if (index === -1) throw Error('No such element in slider');
    this.currentElementIndex = index;

    const translate = (index / this.components.length) * 100;
    this.element.style.transform = `translateX(${-translate}%)`;

    setTimeout(() => {
      component.removeClass(SliderClasses.SliderElementHidden);
    }, this.slideTime / 2);
  }
}
