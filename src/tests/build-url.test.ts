import buildURL from '../utils/build-url';

describe('URL builder', () => {
  it('builds correct URL when path is specified', () => {
    const path = ['rs.school', 'docs', 'bla-bla'];
    const url = buildURL(path);
    expect(url).toBe('rs.school/docs/bla-bla');
  });
  it('builds correct URL when query parameters are specified', () => {
    const path = ['rs.school', 'docs', 'bla-bla'];
    const queryParams = {
      userId: 'quaqva',
      github: 'quaqvagit',
    };
    const url = buildURL(path, queryParams);
    expect(url).toBe('rs.school/docs/bla-bla?userId=quaqva&github=quaqvagit');
  });
});
