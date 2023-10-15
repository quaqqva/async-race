import { Events, Tags } from '../../types/dom-types';
import DOMComponent, { ElementParameters } from '../base-component';

export default class Menu extends DOMComponent<HTMLDivElement> {
  private buttons: DOMComponent<HTMLButtonElement>[];

  private clickHandlers: (() => void)[];

  public constructor({
    params,
    buttonTexts,
    clickHandlers,
    buttonClasses,
  }: {
    params: ElementParameters;
    buttonTexts: string[];
    clickHandlers: (() => void)[];
    buttonClasses?: string[];
  }) {
    super(params);
    this.buttons = buttonTexts.map(
      (buttonText, index) =>
        new DOMComponent<HTMLButtonElement>({
          tag: Tags.Button,
          textContent: buttonText,
          classes: buttonClasses ? [buttonClasses[index]] : undefined,
          parent: this,
        })
    );
    this.clickHandlers = clickHandlers;

    this.addEventListener(Events.Click, (event) => {
      const clicked = event.target as Node;
      const isButton = clicked instanceof HTMLButtonElement;
      if (isButton || clicked.parentNode instanceof HTMLButtonElement) {
        const parent = isButton ? clicked.parentNode : clicked.parentNode?.parentNode;
        const button = isButton ? clicked : clicked.parentNode;

        const index = Array.prototype.indexOf.call(parent?.children, button);
        this.clickHandlers[index]();
      }
    });
  }

  public addButton({ buttonText, callback }: { buttonText: string; callback: () => void }): void {
    this.append(
      new DOMComponent<HTMLButtonElement>({
        tag: Tags.Button,
        textContent: buttonText,
      })
    );
    this.clickHandlers.push(callback);
  }

  public getButton(index: number): DOMComponent<HTMLButtonElement> {
    return this.buttons[index];
  }

  public enableButton(index: number): void {
    const button = this.getButton(index);
    button.removeAttribute('disabled');
  }

  public disableButton(index: number): void {
    const button = this.getButton(index);
    button.setAttribute('disabled', true.toString());
  }

  public forEachButton(callback: (button: DOMComponent<HTMLButtonElement>, index: number) => void): void {
    this.buttons.forEach((button, index) => callback(button, index));
  }
}
