// worker.js
self.addEventListener("message", async (event) => {
    const data = event.data;
    if (data.type !== "js_run_js_benchmark") return;

    const { id, repetitions, messageSizeMb } = data;
    try {
        // small delay to mimic async setup
        await new Promise((r) => setTimeout(r, 100));

        const fileSizeBytes = Math.floor(messageSizeMb * 1024 * 1024);
        const buffer = getRandomBuffer(fileSizeBytes);

        let totalEnc = 0,
            totalDec = 0,
            successCount = 0;
        let ciphertext = null;

        const t0 = performance.now();

        for (let i = 0; i < repetitions; i++) {
            // generate AES-GCM key
            const key = await crypto.subtle.generateKey(
                { name: "AES-GCM", length: 128 },
                true,
                ["encrypt", "decrypt"]
            );
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // encrypt
            const encStart = performance.now();
            const ctBuf = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                buffer
            );
            totalEnc += performance.now() - encStart;
            ciphertext = ctBuf;

            // decrypt + verify
            const decStart = performance.now();
            try {
                const ptBuf = await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: iv },
                    key,
                    ctBuf
                );
                if (buffersEqual(ptBuf, buffer)) {
                    successCount++;
                }
            } catch (_) {
                // fail silently
            }
            totalDec += performance.now() - decStart;
        }

        const overall = performance.now() - t0;

        const result = {
            repetitions,
            message_size_mb: messageSizeMb,
            encrypt_avg_ms: totalEnc / repetitions,
            decrypt_avg_ms: totalDec / repetitions,
            crypto_total_ms: totalEnc + totalDec,
            overall_time_ms: overall,
            integrity_ok: successCount === repetitions,
            success_count: successCount,
            success_percentage: (successCount / repetitions) * 100,
            ciphertext_bytes: ciphertext.byteLength,
        };

        self.postMessage({ id, json: JSON.stringify(result) });
    } catch (err) {
        self.postMessage({ id, error: `Error in worker: ${err.message}` });
    }
});

// Helper: fill a large Uint8Array with random values in 64k chunks
function getRandomBuffer(size) {
    const buf = new Uint8Array(size);
    const chunk = 65536;
    for (let offset = 0; offset < size; offset += chunk) {
        const end = Math.min(offset + chunk, size);
        crypto.getRandomValues(buf.subarray(offset, end));
    }
    return buf.buffer;
}

// Helper: compare two ArrayBuffers
function buffersEqual(a, b) {
    if (a.byteLength !== b.byteLength) return false;
    const v1 = new Uint8Array(a);
    const v2 = new Uint8Array(b);
    for (let i = 0; i < v1.length; i++) {
        if (v1[i] !== v2[i]) return false;
    }
    return true;
}
