self.addEventListener("message", async (event) => {
    const data = event.data;

    if (data.type === "js_run_js_benchmark") {
        try {
            const { id, repetitions, fileSizeMb, workerTime } = data;

            await new Promise((r) => setTimeout(r, 100));

            const fileSizeBytes = Math.floor(fileSizeMb * 1024 * 1024);
            const buffer = getRandomBuffer(fileSizeBytes);

            let totalHashTime = 0;
            let totalVerifyTime = 0;
            let lastDigest = "";

            const encoder = new TextEncoder();

            const startBenchmark = performance.now();

            for (let i = 0; i < repetitions; i++) {
                const hashStart = performance.now();
                const hashBuffer = await crypto.subtle.digest(
                    "SHA-256",
                    buffer
                );
                totalHashTime += performance.now() - hashStart;

                const verifyStart = performance.now();
                const verifyBuffer = await crypto.subtle.digest(
                    "SHA-256",
                    buffer
                );
                totalVerifyTime += performance.now() - verifyStart;

                lastDigest = [...new Uint8Array(hashBuffer)]
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");
            }

            const totalTime = performance.now() - startBenchmark;

            const result = {
                repetitions,
                file_size_mb: fileSizeMb,
                hash_avg_time_ms: totalHashTime / repetitions,
                verify_avg_time_ms: totalVerifyTime / repetitions,
                total_time_ms: totalHashTime + totalVerifyTime,
                last_digest: lastDigest,
                total_time: totalTime,
            };

            self.postMessage({ id, json: JSON.stringify(result) });
        } catch (error) {
            self.postMessage({
                id: data.id,
                error: `Error in worker: ${error.message}`,
            });
        }
    }
});

function getRandomBuffer(size) {
    const buffer = new Uint8Array(size);
    const chunkSize = 65536;
    for (let offset = 0; offset < size; offset += chunkSize) {
        const chunk = Math.min(chunkSize, size - offset);
        crypto.getRandomValues(buffer.subarray(offset, offset + chunk));
    }
    return buffer;
}
