import data from './dataset.json';

export default function generateCarName(): string {
  const carNames = data as string[];
  const index = Math.floor(Math.random() * carNames.length);
  return carNames[index];
}
