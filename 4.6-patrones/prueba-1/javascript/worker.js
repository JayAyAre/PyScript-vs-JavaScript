import { RandomForestClassifier as RFClassifier } from "https://jspm.dev/ml-random-forest";

self.addEventListener("message", async (e) => {
    const { id, type, workerTime, repetitions } = e.data;
    if (type !== "js_run_js_benchmark") return;

    // 1) Descarga y parseo del CSV de Iris
    const IRIS_CSV_URL =
        "https://raw.githubusercontent.com/uiuc-cse/data-fa14/gh-pages/data/iris.csv";
    const resp = await fetch(IRIS_CSV_URL);
    const raw = await resp.text();
    const rows = raw.trim().split("\n").slice(1);

    // 2) Creamos IrisDataset con la API que quieres
    const IrisDataset = {
        getNumbers: () => rows.map((r) => r.split(",").slice(0, 4).map(Number)),
        getClasses: () => rows.map((r) => r.split(",")[4]),
        getDistinctClasses: () =>
            Array.from(new Set(rows.map((r) => r.split(",")[4]))),
    };

    // 3) Obtenemos trainingSet y labels
    const trainingSet = IrisDataset.getNumbers();
    const predictions = IrisDataset.getClasses().map((c) =>
        IrisDataset.getDistinctClasses().indexOf(c)
    );

    // 4) Configuración del RF (100 árboles para igualar sklearn)
    const options = {
        seed: 3,
        maxFeatures: 1.0,
        replacement: true,
        nEstimators: 100,
    };

    let totalTrain = 0,
        totalInfer = 0,
        totalAcc = 0,
        clf;

    const t0All = performance.now();
    for (let i = 0; i < repetitions; i++) {
        // entrenamiento
        const t0 = performance.now();
        clf = new RFClassifier(options);
        clf.train(trainingSet, predictions);
        totalTrain += performance.now() - t0;

        // inferencia
        const t1 = performance.now();
        const preds = clf.predict(trainingSet);
        totalInfer += performance.now() - t1;

        // precisión
        const correct = preds.reduce(
            (sum, p, idx) => sum + (p === predictions[idx] ? 1 : 0),
            0
        );
        totalAcc += (correct / predictions.length) * 100;
    }
    const overall = performance.now() - t0All;

    // 5) Serializa el modelo para medir tamaño
    const modelJson = JSON.stringify(clf.toJSON());
    const modelSizeMB = new Blob([modelJson]).size / 1024 ** 2;

    // 6) Envía el resultado de vuelta
    const result = {
        training_time_ms: totalTrain / repetitions,
        inference_time_ms: totalInfer / repetitions,
        accuracy: totalAcc / repetitions,
        model_size_mb: modelSizeMB,
        overall_time_ms: overall,
    };
    self.postMessage({ id, json: JSON.stringify(result) });
});
