import { Car } from '../app/model/car';
import { DriveData, EngineStatus } from '../app/model/drive';
import { WinnersSortOrder, WinnersSortCriteria } from '../app/model/winner';

export type PageLoadRequestData = {
  page: number;
  order?: WinnersSortOrder;
  criteria?: WinnersSortCriteria;
};

export type EngineRequestData = {
  id: number;
  engineStatus: EngineStatus.Started | EngineStatus.Stopped;
};

export type CarDeleteResponseData = {
  id: number;
  replace?: Car;
};

export type EngineResponseData = {
  id: number;
  engineStatus: EngineStatus;
  driveData: DriveData;
};

export type UpdateWinnerRequestData = {
  car: Car;
  time: number;
};

export type CarDriveResponseData = {
  id: number;
  isDriving: boolean;
};
