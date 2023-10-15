import FormModal from '../../../../components/modals/form-modal';
import { InputTypes } from '../../../../types/dom-types';
import EventEmitter from '../../../../utils/event-emitter';
import AppEvents from '../../../app-events';
import { Car, CarViewData } from '../../../model/car';

enum SubmitCarModalElements {
  Modal = 'submit-car-modal',
}

export default class SubmitCarModal extends FormModal {
  private static MODAL_PARAMS = {
    classes: [SubmitCarModalElements.Modal],
  };

  private static TITLE = 'Enter car info';

  private static INPUTS: string[] = ['Name', 'Color'];

  private static PALETTE_ID = 'app-colors';

  private static INPUTS_TYPES: InputTypes[] = [InputTypes.Text, InputTypes.Color];

  public constructor(emitter: EventEmitter, carData?: Car) {
    const submitHandler = (formData: string[]) => {
      const carViewData: CarViewData = {
        name: formData[0],
        color: formData[1],
      };

      if (carData) {
        const car: Car = { id: carData.id, ...carViewData };
        emitter.emit(AppEvents.CarUpdate, car);
      } else emitter.emit(AppEvents.CarCreate, carViewData);
    };

    let inputValues: string[] | undefined;
    if (carData) inputValues = [carData.name, carData.color];

    super({
      elementParams: SubmitCarModal.MODAL_PARAMS,
      inputNames: SubmitCarModal.INPUTS,
      inputTypes: SubmitCarModal.INPUTS_TYPES,
      inputValues,
      windowTitle: SubmitCarModal.TITLE,
      colorsPaletteId: SubmitCarModal.PALETTE_ID,
      onSubmit: submitHandler,
    });
  }
}
