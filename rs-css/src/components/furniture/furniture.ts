import { ElementParameters } from '../../types/default';
import { Tags } from '../../types/dom-types';
import BaseComponent from '../base-component';
import Pet from './pet';

export default class Furniture extends BaseComponent<HTMLDivElement> {
  private pets: Pet[];

  private name: string;

  private static MARKUP_PARAMS = {
    tag: Tags.Code,
    classes: ['markup'],
  };

  public constructor(params: Partial<ElementParameters> & { name: string }) {
    super(params);
    this.name = params.name;
    this.pets = [];
  }

  public getMarkup(): BaseComponent<HTMLElement> {
    const markupComponent = new BaseComponent<HTMLElement>(Furniture.MARKUP_PARAMS);
    markupComponent.append(new BaseComponent<HTMLSpanElement>({ tag: Tags.Span, textContent: `<${this.name}>\n` }));
    markupComponent.append(...this.pets.map((pet) => pet.getMarkup(1)));
    markupComponent.append(new BaseComponent<HTMLSpanElement>({ tag: Tags.Span, textContent: `</${this.name}>` }));
    return markupComponent;
  }

  public override append(...elements: Pet[]): void {
    super.append(...elements);
    this.pets.push(...elements);
  }
}
