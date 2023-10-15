export type Winner = {
  id: number;
  wins: number;
  time: number;
};

export enum WinnersSortCriteria {
  Id = 'id',
  Wins = 'wins',
  Time = 'time',
}

export enum WinnersSortOrder {
  Ascending = 'ASC',
  Descending = 'DESC',
}
