import type { APIRoute } from 'astro';

export const prerender = false;

let activeRequests = 0;

export const GET: APIRoute = async ({ params }) => {
    activeRequests++;
    // console.log(`Concurrent requests: ${activeRequests}`);

    const delayString = params.delay ?? '0';
    const delay = Math.max(0, Number(delayString.split('.')[0]));

    if (delay > 0) {
        await new Promise((r) => setTimeout(r, delay));
    }

    activeRequests--;

    const data = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        value: Math.random(),
    }));

    return new Response(
        JSON.stringify({
            status: 'success',
            delay,
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
