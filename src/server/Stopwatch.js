// USAGE
//
//   const stopwatch = new Stopwatch();
//
//   // label and record time since last record
//   stopwatch.record('query entries');
//   stopwatch.record('calculate cache');
//   stopwatch.record('write cache');
//
//   // time asynchronous functions / promises
//   await Promise.all([
//     stopwatch.time(unrand_query.run()).record('unrand_query.run()'),
//     stopwatch.time(new Promise((resolve) => setTimeout(resolve, 1 * 1000))).record('sleep 1s'),
//     stopwatch.time(new Promise((resolve) => setTimeout(resolve, 3 * 1000))).record('sleep 3s'),
//   ]);
//
//   // returns all recorded times
//   stopwatch.list()

export function Stopwatch() {
  let record_list = [];
  let start_time = process.hrtime();
  let init_time = process.hrtime();

  return { elapsed_ms, start, list, reset, record, time };

  function elapsed_ms() {
    const [ms] = time_record(init_time, 'ms');
    return ms;
  }

  function start() {
    start_time = process.hrtime();
  }

  function list() {
    return record_list;
  }

  function reset() {
    record_list = [];
    init_time = process.hrtime();
    start();
  }

  function record(label, unit) {
    const entry = [label, time_record(start_time, unit)];
    record_list.push(entry);

    // reset start_time for next record() call
    start();
  }

  function time(promise) {
    const start_time = process.hrtime();

    let record_args;

    promise.then(() => {
      const [label, unit] = record_args;
      const entry = [label, time_record(start_time, unit)];
      record_list.push(entry);
    });

    function record(...args) {
      record_args = args;
      return promise;
    }

    return { record };
  }
}

function time_record(start_time, unit = 'ms') {
  // capture delta hrtime since last start_time
  const delta_hrtime = process.hrtime(start_time);
  return [hrtime_unit(delta_hrtime, unit), unit];
}

function hrtime_unit(hrtime, unit = 'ms') {
  switch (unit) {
    case 'ms':
      return hrtime[0] * 1e3 + hrtime[1] / 1e6;
    case 'micro':
      return hrtime[0] * 1e6 + hrtime[1] / 1e3;
    case 'nano':
    default:
      return hrtime[0] * 1e9 + hrtime[1];
  }
}
