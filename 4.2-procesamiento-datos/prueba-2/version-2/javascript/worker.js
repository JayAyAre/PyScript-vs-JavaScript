
function createDataStructure(size) {
  const start = performance.now();
  const data = new Int32Array(size);
  for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 1000);
  }
  const time = performance.now() - start;
  const memory = data.byteLength / (1024 * 1024); 
  return { data, time, memory };
}

function calculateSum(data) {
  const start = performance.now();
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
      sum += data[i];
  }

  const time = performance.now() - start;
  return { result: sum, time };
}

function calculateMean(data, sum) {
  const start = performance.now();
  const mean = sum / data.length;
  const time = performance.now() - start;
  return { result: mean, time };
}

function calculateStd(data, mean) {
  const start = performance.now();
  let sumSqDiff = 0;
  for (let i = 0; i < data.length; i++) {
      const diff = data[i] - mean;
      sumSqDiff += diff * diff;
  }
  const variance = sumSqDiff / data.length;
  const std = Math.sqrt(variance);
  const time = performance.now() - start;
  return { result: std, time };
}

self.onmessage = function(event) {
  const size = event.data.size;
  if (!size) {
      self.postMessage({ error: "Size not provided" });
      return;
  }

  try {
      const metrics = {};
      const startTotal = performance.now();

      const createResult = createDataStructure(size);
      const dataMemoryMB = createResult.memory;
      metrics.create = { time: createResult.time, memory: dataMemoryMB };
      const data = createResult.data;

      const sumResult = calculateSum(data);
      metrics.sum = { time: sumResult.time, memory: dataMemoryMB };

      const meanResult = calculateMean(data, sumResult.result);
      metrics.mean = { time: meanResult.time, memory: dataMemoryMB };

      const stdResult = calculateStd(data, meanResult.result);
      metrics.std = { time: stdResult.time, memory: dataMemoryMB };

      const totalTime = performance.now() - startTotal;
      metrics.total = {
          time: totalTime,
          memory: dataMemoryMB
      };

      self.postMessage({ results: metrics });

  } catch (e) {
      self.postMessage({ error: e.message, stack: e.stack });
  }
};