import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
    cookies.delete('session_user_id', { path: '/' });
    return new Response(JSON.stringify({ message: 'Logged out' }));
};
