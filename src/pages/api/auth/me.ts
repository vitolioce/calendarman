import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
    if (locals.user) {
        const { passwordHash, ...user } = locals.user;
        return new Response(JSON.stringify(user));
    }
    return new Response(JSON.stringify({ error: 'Not logged in' }), { status: 401 });
};
