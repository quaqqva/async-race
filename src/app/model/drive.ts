export type DriveData = {
  velocity: number;
  distance: number;
};

export enum EngineStatus {
  Started = 'started',
  Drive = 'drive',
  Stopped = 'stopped',
}
