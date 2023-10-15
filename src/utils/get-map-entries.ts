export function getMapKeys<T>(map: Map<T, unknown>): T[] {
  const keys: T[] = [];
  map.forEach((_, key) => {
    keys.push(key);
  });
  return keys;
}

export function getMapValues<T>(map: Map<unknown, T>): T[] {
  const values: T[] = [];
  map.forEach((value) => {
    values.push(value);
  });
  return values;
}
