import { Events, Tags } from '../../../types/dom-types';
import DOMComponent, { ElementParameters } from '../../base-component';
import CheckboxComponent from '../checkbox-input';
import './toggle-input-styles.scss';

enum ToggleInputClasses {
  ToggleInput = 'toggle-input',
  Checkbox = 'toggle-input__checkbox',
  SwitchButton = 'toggle-input__button',
  OptionsWrapper = 'toggle-input__options',
  FirstOptionLabel = 'toggle-input__first-option',
  SecondOptionLabel = 'toggle-input__second-option',
}

export default class ToggleInput extends DOMComponent<HTMLDivElement> {
  private static ELEMENT_PARAMS: ElementParameters = {
    classes: [ToggleInputClasses.ToggleInput],
  };

  private static SWITCH_BUTTON_PARAMS: ElementParameters = {
    tag: Tags.Div,
    classes: [ToggleInputClasses.SwitchButton],
  };

  private static OPTIONS_WRAPPER_PARAMS: ElementParameters = {
    classes: [ToggleInputClasses.OptionsWrapper],
  };

  private static FIRST_OPTION_PARAMS: ElementParameters = {
    tag: Tags.Label,
    classes: [ToggleInputClasses.FirstOptionLabel],
  };

  private static SECOND_OPTION_PARAMS: ElementParameters = {
    tag: Tags.Label,
    classes: [ToggleInputClasses.SecondOptionLabel],
  };

  private checkbox: CheckboxComponent;

  private firstOptionLabel: DOMComponent<HTMLLabelElement>;

  private secondOptionLabel: DOMComponent<HTMLLabelElement>;

  private button: DOMComponent<HTMLDivElement>;

  public constructor({ options, parent }: { options: [string, string]; parent?: DOMComponent<HTMLElement> }) {
    super({ ...ToggleInput.ELEMENT_PARAMS, parent });
    this.checkbox = new CheckboxComponent(this);
    this.checkbox.addClass(ToggleInputClasses.Checkbox);

    this.button = new DOMComponent<HTMLDivElement>({
      ...ToggleInput.SWITCH_BUTTON_PARAMS,
      parent: this,
    });

    const optionsWrapper = new DOMComponent({
      ...ToggleInput.OPTIONS_WRAPPER_PARAMS,
      parent: this,
    });
    this.firstOptionLabel = new DOMComponent<HTMLLabelElement>({
      ...ToggleInput.FIRST_OPTION_PARAMS,
      textContent: options[0],
      parent: optionsWrapper,
    });
    this.secondOptionLabel = new DOMComponent<HTMLLabelElement>({
      ...ToggleInput.SECOND_OPTION_PARAMS,
      textContent: options[1],
      parent: optionsWrapper,
    });
  }

  public addInputListener(handler: (event: Event) => void): void {
    this.checkbox.addEventListener(Events.Input, handler);
  }

  public toggle(): void {
    this.checkbox.toggle();
  }
}
