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

export const PATCH: APIRoute = async ({ params, request, locals }) => {
    const user = locals.user as User | undefined;
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { id } = params;
    if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });

    const event = await getEventById(id);
    if (!event) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    // Permetti la modifica solo al creatore o a un admin
    if (event.creatorId !== user.id && !user.isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    try {
        const data = await request.json();
        const { title, description, date, time, location } = data;

        const updates: Partial<Event> = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (date !== undefined) updates.date = date;
        if (time !== undefined) updates.time = time;
        if (location !== undefined) updates.location = location;

        await import('../../../lib/db').then(db => db.updateEvent(id, updates));

        return new Response(JSON.stringify({ message: 'Updated' }));
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
