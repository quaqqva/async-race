export default function buildURL(path: string[], queryParams?: { [query: string]: string }): string {
  let url = path.join('/');
  if (queryParams) {
    url += `?${Object.entries(queryParams)
      .map((valuePair) => {
        const [key, value] = valuePair;
        return `${key}=${value}`;
      })
      .join('&')}`;
  }
  return url;
}
