/*
 *
 */
self.importScripts('math.min.js');

self.onmessage = e => {
  const { raw, expression, t_offset } = e.data;
  let error = null;

  try {

    for (let t = 0; t < raw.length; ++t)
      raw[t] = ~~(math.evaluate(expression, { t: t + t_offset }) % 256);

  } catch(e) {

    error = e.message;

  }

  self.postMessage({ raw, error });
}
