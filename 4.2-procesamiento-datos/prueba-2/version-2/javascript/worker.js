function createDataStructure(size) {
  const start = performance.now();
  const data = new Int32Array(size);
  for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 1000);
  }
  const end = performance.now();

  const memory = data.byteLength / (1024 * 1024);
  return { data, time: end - start, memory };
}

function calculateSum(data) {
  const start = performance.now();
  let totalSum = data.reduce((acc, val) => acc + val, 0);
  const end = performance.now();

  return { result: totalSum, time: end - start };
}

function calculateMean(data, totalSum) {
  const start = performance.now();
  const mean = totalSum / data.length;
  const end = performance.now();

  return { result: mean, time: end - start };
}

function calculateStd(data, mean) {
  const start = performance.now();
  let sumSqDiff = 0;
  for (let i = 0; i < data.length; i++) {
      let diff = data[i] - mean;
      sumSqDiff += diff * diff;
  }
  const variance = sumSqDiff / data.length;
  const std = Math.sqrt(variance);
  const end = performance.now();

  return { result: std, time: end - start };
}

self.onmessage = function (event) {
  const size = event.data.size;
  if (!size) {
      self.postMessage({ error: "Size not provided" });
      return;
  }

  try {
      const metrics = {};
      const startTotal = performance.now();

      // Create
      const createResult = createDataStructure(size);
      const dataMemoryMB = createResult.memory;
      metrics.create = { time: createResult.time, memory: dataMemoryMB };
      const data = createResult.data;

      // Sum
      const sumResult = calculateSum(data);
      metrics.sum = { time: sumResult.time, memory: dataMemoryMB };

      // Mean
      const meanResult = calculateMean(data, sumResult.result);
      metrics.mean = { time: meanResult.time, memory: dataMemoryMB };

      // Std
      const stdResult = calculateStd(data, meanResult.result);
      metrics.std = { time: stdResult.time, memory: dataMemoryMB };

      // Total
      const totalTime = performance.now() - startTotal;
      const totalTimeExact = createResult.time + sumResult.time + meanResult.time + stdResult.time;
      metrics.total = {
          time: totalTime,
          memory: dataMemoryMB,
          exact_time: totalTimeExact};
      self.postMessage({ results: metrics })

  } catch (e) {
      self.postMessage({ error: e.message, stack: e.stack });
  }
};
