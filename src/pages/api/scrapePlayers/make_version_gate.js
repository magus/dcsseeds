import * as semver from 'src/utils/semver';

// check whether passed version is allowed
//    denied (gated)  => true
//    allowed         => falsy
export function make_version_gate(min_version_list) {
  const [lower_bound_version] = min_version_list;

  const min_version_map = {};

  for (const version of min_version_list) {
    min_version_map[version_key(version)] = version;
  }

  return function version_gate(version) {
    // immediately return true if version is below min version
    if (semver.compare(lower_bound_version, version) > 0) {
      return true;
    }

    const min_version = min_version_map[version_key(version)];

    // if there's no entry, it means we are a future version
    // allow future versions parsing immediately on release
    if (!min_version) {
      return false;
    }

    // otherwise, compare and ensure we are not below min version
    if (semver.compare(min_version, version) > 0) {
      return true;
    }

    // getting to this point means we are valid
    return false;
  };
}

function version_key(version) {
  const [major, minor] = semver.parts(version);
  return `${major}.${minor}`;
}
