import KNN from "https://cdn.skypack.dev/ml-knn";

self.addEventListener("message", async (e) => {
    const { id, type, repetitions } = e.data;
    if (type !== "do_analisis") return;

    const DIGITS_URL = "../json/digits.json";
    const resp = await fetch(DIGITS_URL);
    const { data, target } = await resp.json();

    function trainTestSplit(X, y, testRatio = 0.3) {
        const indices = [...X.keys()];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const testCount = Math.floor(X.length * testRatio);
        const testIdx = indices.slice(0, testCount);
        const trainIdx = indices.slice(testCount);

        const X_train = trainIdx.map((i) => X[i]);
        const y_train = trainIdx.map((i) => y[i]);
        const X_test = testIdx.map((i) => X[i]);
        const y_test = testIdx.map((i) => y[i]);

        return { X_train, y_train, X_test, y_test };
    }

    let totalTrain = 0,
        totalInfer = 0,
        totalAcc = 0,
        model;

    const t0All = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const { X_train, y_train, X_test, y_test } = trainTestSplit(
            data,
            target
        );

        const t0 = performance.now();
        model = new KNN(X_train, y_train, { k: 3 });
        totalTrain += performance.now() - t0;

        const t1 = performance.now();
        const preds = model.predict(X_test);
        totalInfer += performance.now() - t1;

        const correct = preds.reduce(
            (sum, p, idx) => sum + (p === y_test[idx] ? 1 : 0),
            0
        );
        totalAcc += (correct / y_test.length) * 100;
    }

    const overall = performance.now() - t0All;

    const modelJson = JSON.stringify(model.toJSON());
    const modelSizeMB = new Blob([modelJson]).size / 1024 ** 2;

    const result = {
        training_time_ms: totalTrain / repetitions,
        inference_time_ms: totalInfer / repetitions,
        accuracy: totalAcc / repetitions,
        model_size_mb: modelSizeMB,
        overall_time_ms: overall,
    };

    self.postMessage({ id, json: JSON.stringify(result) });
});
