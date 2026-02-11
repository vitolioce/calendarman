import type { APIRoute } from 'astro';
import { addParticipant, getEventById, removeParticipant, type Participant } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { eventId } = await request.json();
        if (!eventId) {
            return new Response(JSON.stringify({ error: 'Missing eventId' }), { status: 400 });
        }

        const event = await getEventById(eventId);
        if (!event) {
            return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
        }

        // Check if event is past? User didn't strictly forbid joining past events in logic, but "Events passed must be visible ... but distinct".
        // Usually you can't join past events.
        if (new Date(event.date) < new Date()) {
            return new Response(JSON.stringify({ error: 'Cannot join past events' }), { status: 400 });
        }

        const participant: Participant = {
            eventId,
            userId: locals.user.id,
            timestamp: new Date().toISOString(),
        };

        await addParticipant(participant);
        return new Response(JSON.stringify({ message: 'Joined successfully' }));
    } catch (error) {
        if ((error as Error).message === 'User is already participating in this event.') {
            return new Response(JSON.stringify({ error: 'Already joined' }), { status: 409 });
        }
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { eventId } = await request.json();
        if (!eventId) {
            return new Response(JSON.stringify({ error: 'Missing eventId' }), { status: 400 });
        }

        await removeParticipant(eventId, locals.user.id);
        return new Response(JSON.stringify({ message: 'Participation removed' }));
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
