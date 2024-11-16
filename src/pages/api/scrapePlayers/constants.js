import { make_version_gate } from './make_version_gate';

// date when minimum allowed version was released
// this can be used to skip morgues before min version
// e.g. https://github.com/crawl/crawl/tree/0.27.1
export const MINIMUM_ALLOWED_DATE = new Date('2021-08-18');

export const VERSION_LIST = ['0.27', '0.28', '0.29', '0.30', '0.31', '0.32'];

export const version_gate = make_version_gate(['0.27.1', '0.28.0', '0.29.1']);
