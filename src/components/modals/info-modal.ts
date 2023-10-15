import { Events, Tags } from '../../types/dom-types';
import DOMComponent, { ElementParameters } from '../base-component';
import Modal from './base-modal';

enum InfoModalElements {
  Container = 'info-modal',
  Info = 'info-modal__info',
  OKButton = 'info-modal__ok',
}

export default class InfoModal extends Modal {
  private static TEXT_PARAMS: ElementParameters = {
    tag: Tags.Heading2,
    classes: [InfoModalElements.Info],
  };

  private static OK_BUTTON_PARAMS: ElementParameters = {
    tag: Tags.Button,
    textContent: 'ok',
    classes: [InfoModalElements.OKButton],
  };

  public constructor({ params, info, showTime }: { params: ElementParameters; info: string; showTime?: number }) {
    super(params, showTime);
    this.addClass(InfoModalElements.Container);

    this.append(
      new DOMComponent<HTMLHeadingElement>({
        ...InfoModal.TEXT_PARAMS,
        textContent: info,
      }),
      new DOMComponent<HTMLButtonElement>(InfoModal.OK_BUTTON_PARAMS)
    );

    this.addEventListener(Events.Click, (event: Event) => {
      if (event.target instanceof HTMLButtonElement) this.hide();
    });
  }
}
