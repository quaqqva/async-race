import data from './car-categories.json';

export enum CarCategory {
  Sport = 1,
  SportCheap,
  OldCheap,
  VeryOld,
  Old,
  Muscle,
  SportExpensive,
}

export function getCarCategory(carBrand: string): CarCategory {
  const categories = data as { [category: string]: string[] };
  let category = CarCategory.Sport;
  Object.entries(categories).forEach((entry, index) => {
    const brands = entry[1];
    if (brands.includes(carBrand)) category = (index + 1) as CarCategory;
  });
  return category;
}
