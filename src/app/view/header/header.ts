import { Tags } from '../../../types/dom-types';
import DOMComponent, { ElementParameters } from '../../../components/base-component';
import ToggleInput from '../../../components/checkbox-input/toggle-input/toggle-input';
import EventEmitter from '../../../utils/event-emitter';
import AppEvents from '../../app-events';

enum HeaderClasses {
  Header = 'header',
  ViewSwitch = 'header__view-switch',
}

export default class Header extends DOMComponent<HTMLElement> {
  private static ELEMENT_PARAMS: ElementParameters = {
    tag: Tags.Header,
    classes: [HeaderClasses.Header],
  };

  private viewOptions: [string, string] = ['garage', 'winners'];

  private viewsSwitch: ToggleInput;

  public constructor({ emitter, parent }: { emitter: EventEmitter; parent?: DOMComponent<HTMLElement> }) {
    super({ ...Header.ELEMENT_PARAMS, parent });
    this.viewsSwitch = new ToggleInput({ options: this.viewOptions, parent: this });
    this.viewsSwitch.addClass(HeaderClasses.ViewSwitch);

    this.viewsSwitch.addInputListener(() => {
      emitter.emit(AppEvents.SwitchView, null);
    });
  }
}
