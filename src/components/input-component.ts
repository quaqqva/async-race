import { Tags } from '../types/dom-types';
import DOMComponent, { ElementParameters } from './base-component';

export default class InputDOMComponent extends DOMComponent<HTMLInputElement> {
  public constructor(params: Omit<ElementParameters, 'tag'>) {
    super({
      tag: Tags.Input,
      ...params,
    });
  }

  public set required(value: boolean) {
    this.element.required = value;
  }

  public set value(newValue: string) {
    this.element.value = newValue;
  }

  public get value(): string {
    return this.element.value;
  }
}
