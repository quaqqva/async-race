import DOMComponent, { ElementParameters } from '../../components/base-component';
import SVGComponent from '../../components/svg-component';
import { AnimationFillMode, Tags, TransformOrigin } from '../../types/dom-types';
import trackSprite from '../../assets/img/track_sprite.svg';
import { getCarCategory } from '../../utils/car-name-generator/get-car-category';

enum CarElements {
  Wrapper = 'car-wrapper',
  SVG = 'car',
  EffectPlaceholder = 'car__effect',
  WheelSmokeEffect = 'car__effect_wheel-smoke',
  BreakSmokeEffect = 'car__effect_break-smoke',
}

export default class CarImage extends DOMComponent<HTMLDivElement> {
  private static WRAPPER_PARAMS: ElementParameters = {
    classes: [CarElements.Wrapper],
  };

  private static PLACEHOLDER_PARAMS: ElementParameters = {
    tag: Tags.Image,
    classes: [CarElements.EffectPlaceholder],
  };

  private static MAX_FAST_TIME = 3500;

  private static CAR_DRIVE_ANIMATION = 'car-drive';

  private static CAR_DRIVE_FAST_ANIMATION = 'car-drive-fast';

  private static CAR_STOP_ANIMATION = 'car-stop';

  private static CAR_STOP_COORDS = '--car-stop-at'; // for CSS

  private static STOP_DURATION = 500;

  public static RESET_DURATION = 300;

  private resetAnimationPlaying: boolean;

  private carSVG: SVGComponent;

  private effectPlaceholder: DOMComponent<HTMLImageElement>;

  public constructor(carName: string) {
    super(CarImage.WRAPPER_PARAMS);

    this.carSVG = CarImage.createCarSVG(carName);
    this.carSVG.addClass(CarElements.SVG);
    this.append(this.carSVG);

    this.effectPlaceholder = new DOMComponent<HTMLImageElement>(CarImage.PLACEHOLDER_PARAMS);
    this.append(this.effectPlaceholder);

    this.resetAnimationPlaying = false;
  }

  public setColor(color: string): void {
    this.carSVG.setColor(color);
  }

  public launchCar(travelTime: number): void {
    const isFast = travelTime <= CarImage.MAX_FAST_TIME;
    const animationName = isFast ? CarImage.CAR_DRIVE_FAST_ANIMATION : CarImage.CAR_DRIVE_ANIMATION;
    const transformOrigin = isFast ? TransformOrigin.BottomLeft : TransformOrigin.Center;

    if (isFast) {
      this.effectPlaceholder.addClass(CarElements.WheelSmokeEffect);
      setTimeout(() => {
        this.effectPlaceholder.removeClass(CarElements.WheelSmokeEffect);
      }, travelTime / 5);
    }

    this.showAnimation(
      {
        name: animationName,
        duration: travelTime,
        fillMode: AnimationFillMode.Forwards,
      },
      transformOrigin
    );
  }

  public get isReseting(): boolean {
    return this.resetAnimationPlaying;
  }

  public stop(): void {
    const left = this.getCSSProperty('left');
    this.setCSSProperty('animation', '');

    this.setCSSProperty(CarImage.CAR_STOP_COORDS, left);
    this.showAnimation({
      name: CarImage.CAR_STOP_ANIMATION,
      duration: CarImage.STOP_DURATION,
      fillMode: AnimationFillMode.Forwards,
    });

    setTimeout(() => {
      this.effectPlaceholder.addClass(CarElements.BreakSmokeEffect);
    }, CarImage.STOP_DURATION);
  }

  public reset(): void {
    this.setCSSProperty('opacity', '0');
    this.resetAnimationPlaying = true;

    setTimeout(() => {
      this.setCSSProperty('animation', '');
      this.setCSSProperty(CarImage.CAR_STOP_COORDS, '');
      this.setCSSProperty('opacity', '');
      this.effectPlaceholder.removeClass(CarElements.BreakSmokeEffect);
      this.resetAnimationPlaying = false;
    }, CarImage.RESET_DURATION);
  }

  private static createCarSVG(carName: string): SVGComponent {
    const carBrand = carName.split(' ')[0];
    const carCategory = getCarCategory(carBrand);
    const svg = new SVGComponent({
      pathToSprite: trackSprite,
      id: `car-${carCategory}`,
    });
    svg.addClass(`car-${carCategory}`);
    return svg;
  }
}
