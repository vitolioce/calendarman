import type { APIRoute } from 'astro';
import { getEventById, deleteEvent, getEventParticipants, type Event, type User } from '../../../lib/db';

export const GET: APIRoute = async ({ params, request }) => {
    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });

    const event = await getEventById(id);
    if (!event) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const participants = await getEventParticipants(id);
    return new Response(JSON.stringify({ ...event, participants }));
};

export const DELETE: APIRoute = async ({ params, locals }) => {
    if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });

    const event = await getEventById(id);
    if (!event) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    if (event.creatorId !== locals.user.id) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    await deleteEvent(id);
    return new Response(JSON.stringify({ message: 'Deleted' }));
};
