import { neon } from '@neondatabase/serverless';
import type { User, Event, Participant } from '../types';

export type { User, Event, Participant };

const sql = neon(import.meta.env.DATABASE_URL || process.env.DATABASE_URL || "");

// User CRUD
export async function getUsers(): Promise<User[]> {
    const rows = await sql`
        SELECT id, email, password_hash as "passwordHash", nome, cognome, is_admin as "isAdmin" 
        FROM users
    `;
    return rows as User[];
}

export async function saveUser(user: User): Promise<void> {
    await sql`
        INSERT INTO users (id, email, password_hash, nome, cognome, is_admin)
        VALUES (${user.id}, ${user.email}, ${user.passwordHash}, ${user.nome}, ${user.cognome}, ${user.isAdmin})
    `;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
    const rows = await sql`
        SELECT id, email, password_hash as "passwordHash", nome, cognome, is_admin as "isAdmin" 
        FROM users WHERE email = ${email}
    `;
    return rows[0] as User | undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
    const rows = await sql`
        SELECT id, email, password_hash as "passwordHash", nome, cognome, is_admin as "isAdmin" 
        FROM users WHERE id = ${id}
    `;
    return rows[0] as User | undefined;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
    const current = await findUserById(id);
    if (!current) throw new Error('User not found');

    const final = { ...current, ...updates };

    await sql`
        UPDATE users 
        SET email = ${final.email}, 
            password_hash = ${final.passwordHash}, 
            nome = ${final.nome}, 
            cognome = ${final.cognome}, 
            is_admin = ${final.isAdmin}
        WHERE id = ${id}
    `;
}

export async function deleteUser(id: string): Promise<void> {
    await sql`DELETE FROM users WHERE id = ${id}`;
}

// Event CRUD
export async function getEvents(): Promise<Event[]> {
    const rows = await sql`
        SELECT id, creator_id as "creatorId", title, description, location, date, time 
        FROM events
    `;
    return rows as Event[];
}

export async function saveEvent(event: Event): Promise<void> {
    await sql`
        INSERT INTO events (id, creator_id, title, description, location, date, time)
        VALUES (${event.id}, ${event.creatorId}, ${event.title}, ${event.description}, ${event.location}, ${event.date}, ${event.time})
    `;
}

export async function getEventById(id: string): Promise<Event | undefined> {
    const rows = await sql`
        SELECT id, creator_id as "creatorId", title, description, location, date, time 
        FROM events WHERE id = ${id}
    `;
    return rows[0] as Event | undefined;
}

export async function deleteEvent(id: string): Promise<void> {
    await sql`DELETE FROM events WHERE id = ${id}`;
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    const current = await getEventById(id);
    if (!current) throw new Error('Event not found');

    const final = { ...current, ...updates };

    await sql`
        UPDATE events 
        SET title = ${final.title}, 
            description = ${final.description}, 
            location = ${final.location}, 
            date = ${final.date}, 
            time = ${final.time}
        WHERE id = ${id}
    `;
}


// Participant CRUD
export async function getParticipants(): Promise<Participant[]> {
    const rows = await sql`SELECT event_id as "eventId", user_id as "userId", timestamp FROM participants`;
    return rows as Participant[];
}

export async function addParticipant(participant: Participant): Promise<void> {
    await sql`
        INSERT INTO participants (event_id, user_id)
        VALUES (${participant.eventId}, ${participant.userId})
    `;
}

export async function getEventParticipants(eventId: string): Promise<User[]> {
    const rows = await sql`
        SELECT u.id, u.email, u.nome, u.cognome, u.is_admin as "isAdmin"
        FROM users u
        INNER JOIN participants p ON u.id = p.user_id
        WHERE p.event_id = ${eventId}
    `;
    return rows as User[];
}

export async function removeParticipant(eventId: string, userId: string): Promise<void> {
    await sql`
        DELETE FROM participants 
        WHERE event_id = ${eventId} AND user_id = ${userId}
    `;
}
