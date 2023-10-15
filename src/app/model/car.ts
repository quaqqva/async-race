export type Car = {
  id: number;
  name: string;
  color: string;
};

export type CarViewData = Omit<Car, 'id'>;
