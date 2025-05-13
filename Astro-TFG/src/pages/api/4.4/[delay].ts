// src/pages/api/mock-api/[delay].ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
    const delayString = params.delay || '0'; // Si no hay parámetro, se asume 0
    const delay = Math.max(0, Number(delayString.split('.')[0])); // Obtener el número antes de '.ts'

    const start_time = performance.now();

    if (delay > 0) {
        await new Promise((r) => setTimeout(r, delay));
    }

    const response_time = performance.now() - start_time;

    const data = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        value: Math.random(),
    }));

    return new Response(
        JSON.stringify({
            status: 'success',
            delay,
            response_time,
            data,
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
};
