import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
    const delayParam = url.searchParams.get('delay') ?? '0';
    const idParam = url.searchParams.get('id') ?? null;

    const delay = Math.max(0, Number(delayParam));

    const sessionId = Math.random().toString(36).slice(2);

    const wsUrl = `/api/ws/${sessionId}?delay=${delay}&id=${idParam}`;

    return new Response(JSON.stringify({ wsUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
