import { Tags, Events, InsertPositions, AnimationParams, AnimationFillMode, TransformOrigin } from '../types/dom-types';

export type ElementParameters = Partial<{
  tag: string;
  textContent: string;
  classes: string[];
  attributes: { [attribute: string]: string };
  parent: DOMComponent<HTMLElement>;
}>;
export default class DOMComponent<T extends HTMLElement> {
  protected element: T;

  public static fromHTML<T extends HTMLElement>(html: string): DOMComponent<T> {
    const template = document.createElement(Tags.Template);
    template.insertAdjacentHTML(InsertPositions.Prepend, html);
    const element = template.firstChild as T;
    const component = new DOMComponent<T>({ tag: element.tagName });
    component.element = element;
    return component;
  }

  public static fromElement<T extends HTMLElement>(element: T): DOMComponent<T> {
    const component = new DOMComponent<T>({});
    component.element = element;
    return component;
  }

  public constructor({ tag = Tags.Div, textContent, classes, attributes, parent }: ElementParameters) {
    this.element = document.createElement(tag) as T;

    if (textContent) this.element.innerText = textContent;

    if (classes) this.addClass(...classes);

    if (attributes) {
      Object.keys(attributes).forEach((attribute) => {
        this.setAttribute(attribute, attributes[attribute]);
      });
    }

    if (parent instanceof Node) parent.appendChild(this.element);
    if (parent instanceof DOMComponent) parent.append(this);
  }

  public get HTML(): string {
    return this.element.outerHTML;
  }

  public get textContent(): string {
    return this.element.innerText;
  }

  public set textContent(value: string) {
    this.element.innerText = value;
  }

  public get width(): number {
    return this.element.offsetWidth;
  }

  public get height(): number {
    return this.element.offsetHeight;
  }

  public get fullHeight(): number {
    const marginTop = parseFloat(this.getCSSProperty('margin-top'));
    const marginBottom = parseFloat(this.getCSSProperty('margin-bottom'));
    return marginTop + this.height + marginBottom;
  }

  public get scrolledY(): number {
    return this.element.scrollTop;
  }

  public get scrolledX(): number {
    return this.element.scrollLeft;
  }

  public get isBody(): boolean {
    return this.element === document.body;
  }

  public insertBeforeNode(node: Node) {
    node.parentNode?.insertBefore(this.element, node);
  }

  public prepend(...elements: (Element | DOMComponent<HTMLElement>)[]): void {
    elements.forEach((element) => {
      if (element instanceof DOMComponent) this.element.prepend(element.element);
      else this.element.prepend(element);
    });
  }

  public append(...elements: (Element | DOMComponent<HTMLElement>)[]): void {
    elements.forEach((element) => {
      if (element instanceof DOMComponent) this.element.append(element.element);
      else this.element.append(element);
    });
  }

  public clear(): void {
    this.element.innerHTML = '';
  }

  public addClass(...classNames: string[]): void {
    classNames.forEach((className) => this.element.classList.add(className));
  }

  public removeClass(...classNames: string[]): void {
    classNames.forEach((className) => this.element.classList.remove(className));
  }

  public checkSelectorMatch(selector: string): boolean {
    try {
      return this.element.matches(selector);
    } catch {
      return false;
    }
  }

  public setAttribute(attributeName: string, attributeValue: string): void {
    this.element.setAttribute(attributeName, attributeValue);
  }

  public getAttribute(attributeName: string): string | null {
    return this.element.getAttribute(attributeName);
  }

  public removeAttribute(attributeName: string): void {
    this.element.removeAttribute(attributeName);
  }

  public addEventListener(event: Events, listener: (e: Event) => void): void {
    this.element.addEventListener(event, listener);
  }

  public removeEventListener(event: Events, listener: (e: Event) => void): void {
    this.element.removeEventListener(event, listener);
  }

  public addText(text: string) {
    this.element.append(document.createTextNode(text));
  }

  public destroy(): void {
    this.element.remove();
  }

  public showAnimation(
    { name, duration, timingFunction = 'ease-in-out', fillMode = AnimationFillMode.None }: AnimationParams,
    transformOrigin?: TransformOrigin
  ): void {
    if (transformOrigin) {
      this.element.style.transformOrigin = transformOrigin;
      setTimeout(() => {
        this.removeCSSProperty('transformOrigin');
      }, duration);
    }
    this.element.style.animation = `${name} ${duration}ms ${timingFunction} ${fillMode}`;
  }

  public setCSSProperty(name: string, value: string): void {
    this.element.style.setProperty(name, value);
  }

  public getCSSProperty(name: string): string {
    const computedStyles = this.element.computedStyleMap();
    return computedStyles.get(name)?.toString() || 'undefined';
  }

  public removeCSSProperty(name: string): void {
    this.element.style.removeProperty(name);
  }
}
