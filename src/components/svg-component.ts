import { HTMLSVGElement, Tags } from '../types/dom-types';
import DOMComponent from './base-component';

export default class SVGComponent extends DOMComponent<HTMLSVGElement> {
  private static ELEMENT_NAMESPACE = 'http://www.w3.org/2000/svg';

  private static ATTRIBUTE_NAMESPACE = 'http://www.w3.org/1999/xlink';

  private useElement: Element;

  public constructor({
    pathToSprite,
    id,
    parent,
  }: {
    pathToSprite: string;
    id: string;
    parent?: DOMComponent<HTMLElement>;
  }) {
    super({});
    this.element = <HTMLSVGElement>document.createElementNS(SVGComponent.ELEMENT_NAMESPACE, Tags.SVG);
    this.useElement = document.createElementNS(SVGComponent.ELEMENT_NAMESPACE, Tags.SVGUse);
    this.useElement.setAttributeNS(SVGComponent.ATTRIBUTE_NAMESPACE, 'xlink:href', `${pathToSprite}#${id}`);
    this.element.append(this.useElement);
    if (parent) parent.append(this);
  }

  public setColor(color: string): void {
    this.element.style.fill = color;
  }
}
