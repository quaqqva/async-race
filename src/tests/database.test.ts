/**
 * @jest-environment node
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import fetch from 'node-fetch';
import { EngineStatus } from '../app/model/drive';
import { Winner } from '../app/model/winner';
import CarDatabase from '../app/model/car-database';

describe('database', () => {
  const url = 'http://127.0.0.1:3000';
  const database = new CarDatabase(url);

  describe('garage', () => {
    it('gets entities count from server', async () => {
      const count = await database.getCarsCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    describe('gets entities array from server', () => {
      describe('when no params specified', () => {
        it('returns full array of entities', async () => {
          const cars = await database.getCars({});
          const count = await database.getCarsCount();
          expect(cars.length).toBe(count);
        });
      });

      describe('when numbers of page and entities per page are specified', () => {
        it('returns correct page', async () => {
          const carsPerPage = 2;
          const carsLimited = await database.getCars({ pageNum: 1, carsPerPage });
          expect(carsLimited.length).toBeLessThanOrEqual(carsPerPage);
        });
      });
    });

    it('can create entities', async () => {
      const newCar = {
        name: 'GAZ 21',
        color: '#ffffff',
      };
      const cars = await database.getCars({});
      await database.createCar(newCar);
      const newCount = await database.getCarsCount();
      expect(newCount).toBe(cars.length + 1);
    });

    it('can update entities', async () => {
      const car = (await database.getCars({}))[0];
      car.name = 'BMW X5';
      database.updateCar(car);
      const updatedCar = await database.getCar(car.id);
      expect(car).toEqual(updatedCar);
    });

    it('can delete entities', async () => {
      const cars = await database.getCars({});
      const deleted = cars.at(-1);
      if (deleted) {
        database.deleteCar(deleted.id);
        const newCarsCount = await database.getCarsCount();
        expect(newCarsCount).toBe(cars.length - 1);
      }
    });
  });

  describe('engine', () => {
    it('can start engine and return velocity data', async () => {
      const currentCar = (await database.getCars({}))[0];
      const velocityData = await database.toggleEngine({ carId: currentCar.id, engineStatus: EngineStatus.Started });
      expect(velocityData).toBeDefined();
    });
    it('can switch car to drive mode', async () => {
      const currentCar = (await database.getCars({}))[0];
      const success = await database.switchToDrive(currentCar.id);
      expect(typeof success).toBe('boolean');
    });
    it('can stop engine', async () => {
      const currentCar = (await database.getCars({}))[0];
      const velocityData = await database.toggleEngine({ carId: currentCar.id, engineStatus: EngineStatus.Stopped });
      expect(velocityData).toBeDefined();
    });
  });

  describe('winners', () => {
    it('gets entities count from server', async () => {
      const count = await database.getWinnersCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    describe('gets entities array from server', () => {
      describe('when no params specified', () => {
        it('returns full array of entities', async () => {
          const winners = await database.getWinners({});
          const count = await database.getWinnersCount();
          expect(winners.length).toBe(count);
        });
      });

      describe('when numbers of page and entities per page are specified', () => {
        it('returns correct page', async () => {
          const winnersPerPage = 2;
          const winnersLimited = await database.getWinners({ pageNum: 1, winnersPerPage });
          expect(winnersLimited.length).toBeLessThanOrEqual(winnersPerPage);
        });
      });
    });
    it('can create entities', async () => {
      type CarMockData = {
        id?: number;
        name: string;
        color: string;
        wins: number;
        time: number;
      };
      const carData: CarMockData = {
        name: 'Gaz-21',
        color: '#ffffff',
        wins: 10,
        time: 500,
      };
      carData.id = (await database.createCar(carData)).id;

      const oldCount = await database.getWinnersCount();
      database.createWinner(carData as Winner);
      const newCount = await database.getWinnersCount();
      expect(newCount).toBe(oldCount + 1);
    });

    it('can update entities', async () => {
      const car = (await database.getWinners({}))[0];
      const updatedCar = await database.updateWinner(car);
      const carWinnerData = { id: car.id, wins: car.wins + 1, time: car.time };
      expect(carWinnerData).toEqual(updatedCar);
    });

    it('can delete entities', async () => {
      const winners = await database.getWinners({});
      const deleted = winners.at(-1);
      if (deleted) {
        database.deleteWinner(deleted.id);
        const newCount = await database.getWinnersCount();
        expect(newCount).toBe(winners.length - 1);
      }
    });
  });
});
