import { Events, Tags } from '../../types/dom-types';
import DOMComponent, { ElementParameters } from '../base-component';
import Modal from './base-modal';

enum ConfirmModalElements {
  Container = 'confirm-modal',
  Text = 'confirm-modal__text',
  YesButton = 'confirm-modal__yes',
  NoButton = 'confirm-modal__no',
}

export default class ConfirmModal extends Modal {
  private static TEXT_PARAMS: ElementParameters = {
    tag: Tags.Heading2,
    classes: [ConfirmModalElements.Text],
  };

  private static YES_BUTTON_PARAMS: ElementParameters = {
    tag: Tags.Button,
    textContent: 'yes',
    classes: [ConfirmModalElements.YesButton],
  };

  private static NO_BUTTON_PARAMS: ElementParameters = {
    tag: Tags.Button,
    textContent: 'no',
    classes: [ConfirmModalElements.NoButton],
  };

  public constructor({
    params,
    info,
    yesCallback,
    noCallback,
    showTime,
  }: {
    params: ElementParameters;
    info: string;
    yesCallback: () => void;
    noCallback: () => void;
    showTime?: number;
  }) {
    super(params, showTime);
    this.addClass(ConfirmModalElements.Container);

    this.append(
      new DOMComponent<HTMLHeadingElement>({
        ...ConfirmModal.TEXT_PARAMS,
        textContent: info,
      })
    );

    const yesButton = new DOMComponent<HTMLButtonElement>({ ...ConfirmModal.YES_BUTTON_PARAMS, parent: this });
    yesButton.addEventListener(Events.Click, yesCallback);

    const noButton = new DOMComponent<HTMLButtonElement>({ ...ConfirmModal.NO_BUTTON_PARAMS, parent: this });
    noButton.addEventListener(Events.Click, noCallback);

    this.addEventListener(Events.Click, (event: Event) => {
      if (event.target instanceof HTMLButtonElement) this.hide();
    });
  }
}
