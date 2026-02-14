import type { APIRoute } from 'astro';
import { v4 as uuidv4 } from 'uuid';
import { getEvents, saveEvent, getParticipants, type Event } from '../../../lib/db';

export const GET: APIRoute = async ({ request }) => {
    const events = await getEvents();
    const participants = await getParticipants();

    // Map events to include participant count
    const eventsWithCount = events.map(event => ({
        ...event,
        participantsCount: participants.filter(p => p.eventId === event.id).length
    }));

    // Optional: Filter by month/year if query params provided
    const url = new URL(request.url);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');

    if (month && year) {
        const filtered = eventsWithCount.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
        });
        return new Response(JSON.stringify(filtered));
    }

    return new Response(JSON.stringify(eventsWithCount));
};

export const POST: APIRoute = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const data = await request.json();
        const { title, description, date, time, location } = data;

        if (!title || !date || !time) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const event: Event = {
            id: uuidv4(),
            creatorId: locals.user.id,
            title,
            description: description || '',
            date,
            time,
            location: location || '',
        };

        await saveEvent(event);
        return new Response(JSON.stringify(event), { status: 201 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
