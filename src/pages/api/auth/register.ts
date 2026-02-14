import type { APIRoute } from 'astro';

// Registrazione pubblica disabilitata
// Gli utenti possono essere creati solo dagli amministratori tramite il pannello admin
export const POST: APIRoute = async ({ request }) => {
    return new Response(
        JSON.stringify({
            error: 'Public registration is disabled. Please contact an administrator to create an account.'
        }),
        {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        }
    );
};
