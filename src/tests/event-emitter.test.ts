import EventEmitter from '../utils/event-emitter';

describe('event emitter', () => {
  const eventEmitter = new EventEmitter();
  it('can subscribe to elements and calls handles when event is emitted', () => {
    let i = 0;
    const endValue = 5;
    const eventName = 'increase';

    eventEmitter.subscribe(eventName, (data) => {
      i = data as number;
    });
    eventEmitter.emit(eventName, endValue);
    expect(i).toBe(endValue);
  });
  it("can unsubscribe from specified events so specified handler won't be called", () => {
    let i = 99;
    const endValue = -3245325;
    const eventName = 'decrease';

    const decreaseHandler = (data: unknown) => {
      i = data as number;
    };
    eventEmitter.subscribe(eventName, decreaseHandler);
    eventEmitter.unsubscribe(eventName, decreaseHandler);
    eventEmitter.emit(eventName, endValue);

    expect(i).toBe(99);
  });
});
