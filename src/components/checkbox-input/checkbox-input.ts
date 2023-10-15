import { InputTypes, Tags } from '../../types/dom-types';
import DOMComponent, { ElementParameters } from '../base-component';

export default class CheckboxComponent extends DOMComponent<HTMLInputElement> {
  private static ELEMENT_PARAMS: ElementParameters = {
    tag: Tags.Input,
    attributes: {
      type: InputTypes.Checkbox,
    },
  };

  public constructor(parent: DOMComponent<HTMLElement>) {
    super({ ...CheckboxComponent.ELEMENT_PARAMS, parent });
  }

  public toggle(): void {
    this.element.checked = !this.element.checked;
  }
}
