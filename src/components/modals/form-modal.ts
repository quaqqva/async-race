import { Events, InputTypes, Tags } from '../../types/dom-types';
import DOMComponent, { ElementParameters } from '../base-component';
import InputDOMComponent from '../input-component';
import Modal from './base-modal';

enum SubmitModalElement {
  Form = 'submit-modal__form',
  Title = 'submit-modal__title',
  Label = 'submit-modal__label',
  Input = 'submit-modal__input',
  Submit = 'submit-modal__submit',
}

export default class FormModal extends Modal {
  private static FORM_PARAMS: ElementParameters = {
    tag: Tags.Form,
    classes: [SubmitModalElement.Form],
  };

  private static TITLE_PARAMS: ElementParameters = {
    tag: Tags.Heading2,
    classes: [SubmitModalElement.Title],
  };

  private static LABEL_PARAMS: ElementParameters = {
    tag: Tags.Label,
    classes: [SubmitModalElement.Label],
  };

  private static INPUT_PARAMS: ElementParameters = {
    classes: [SubmitModalElement.Input],
    attributes: {
      required: '',
    },
  };

  private static SUBMIT_BUTTON_PARAMS: ElementParameters = {
    classes: [SubmitModalElement.Submit],
    attributes: {
      type: InputTypes.Submit,
      value: 'Submit',
    },
  };

  private static DEFAULT_INPUT_COLOR = '#ffffff';

  private labels: DOMComponent<HTMLLabelElement>[];

  private inputs: InputDOMComponent[];

  public constructor({
    elementParams,
    inputNames,
    inputTypes,
    inputValues,
    onSubmit,
    windowTitle,
    colorsPaletteId,
    showTime,
  }: {
    elementParams: ElementParameters;
    inputNames: string[];
    inputTypes: InputTypes[];
    inputValues?: string[];
    onSubmit: (formData: string[]) => void;
    windowTitle?: string;
    colorsPaletteId?: string;
    showTime?: number;
  }) {
    super(elementParams, showTime);
    this.labels = inputNames.map(
      (inputName) =>
        new DOMComponent<HTMLLabelElement>({
          ...FormModal.LABEL_PARAMS,
          textContent: inputName,
        })
    );
    this.inputs = inputTypes.map(
      (inputType) =>
        new InputDOMComponent({
          ...FormModal.INPUT_PARAMS,
          attributes: {
            type: inputType,
          },
        })
    );
    if (windowTitle)
      this.append(new DOMComponent<HTMLHeadingElement>({ ...FormModal.TITLE_PARAMS, textContent: windowTitle }));
    const form = this.createForm(inputValues, colorsPaletteId);
    form.addEventListener(Events.Submit, (event: Event) => {
      event.preventDefault();
      this.hide();
      const data = this.inputs.map((input) => input.value);
      onSubmit(data);
    });
  }

  private createForm(inputValues?: string[], colorsPaletteId?: string): DOMComponent<HTMLFormElement> {
    const form = new DOMComponent<HTMLFormElement>({
      ...FormModal.FORM_PARAMS,
      parent: this,
    });

    this.labels.forEach((label, index) => {
      const input = this.inputs[index];
      input.required = true;

      if (inputValues) input.value = inputValues[index];
      else if (input.getAttribute('type') === InputTypes.Color) {
        input.value = FormModal.DEFAULT_INPUT_COLOR;
        if (colorsPaletteId) input.setAttribute('list', colorsPaletteId);
      }

      label.append(input);
      form.append(label);
    });

    form.append(new InputDOMComponent(FormModal.SUBMIT_BUTTON_PARAMS));

    return form;
  }
}
