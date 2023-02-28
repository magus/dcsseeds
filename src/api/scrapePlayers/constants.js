// Adjust this if you want to parse more morgues per request
export const MAX_ITERATIONS_PER_REQUEST = 10;
export const MAX_MORGUES_PER_PLAYER = 1;

export const VERSION_LIST = ['0.27', '0.28', '0.29'];

// minimum version to allow parsing for
// 0.27.0 would allow everything above e.g. 0.27.1, 0.28.0, etc.
export const MINIMUM_ALLOWED_VERSION = '0.27.1';

// date when minimum allowed version was released
// this can be used to skip morgues before min version
// e.g. https://github.com/crawl/crawl/tree/0.27.1
export const MINIMUM_ALLOWED_DATE = new Date('2021-08-18');
