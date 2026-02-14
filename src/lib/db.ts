import fs from 'fs/promises';
import path from 'path';
import type { User, Event, Participant } from '../types';

export type { User, Event, Participant };

const DATA_DIR = path.resolve('./data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (e) {
        // Ignore error if exists
    }
}

async function readJsonFile(filePath: string): Promise<any> {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        // Remove UTF-8 BOM if present
        const cleanData = data.startsWith('\uFEFF') ? data.slice(1) : data;
        return JSON.parse(cleanData);
    } catch (error) {
        if ((error as any).code === 'ENOENT') return [];
        throw error;
    }
}

// User CRUD
export async function getUsers(): Promise<User[]> {
    await ensureDataDir();
    return readJsonFile(USERS_FILE);
}

export async function saveUser(user: User): Promise<void> {
    const users = await getUsers();
    users.push(user);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
    const users = await getUsers();
    return users.find((u) => u.email === email);
}

export async function findUserById(id: string): Promise<User | undefined> {
    const users = await getUsers();
    return users.find((u) => u.id === id);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
    const users = await getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...updates };
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function deleteUser(id: string): Promise<void> {
    const users = await getUsers();
    const filteredUsers = users.filter((u) => u.id !== id);
    await fs.writeFile(USERS_FILE, JSON.stringify(filteredUsers, null, 2), 'utf-8');
}

// Event CRUD
export async function getEvents(): Promise<Event[]> {
    await ensureDataDir();
    return readJsonFile(EVENTS_FILE);
}

export async function saveEvent(event: Event): Promise<void> {
    const events = await getEvents();
    events.push(event);
    await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
}

export async function getEventById(id: string): Promise<Event | undefined> {
    const events = await getEvents();
    return events.find(e => e.id === id);
}

export async function deleteEvent(id: string): Promise<void> {
    const events = await getEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    await fs.writeFile(EVENTS_FILE, JSON.stringify(filteredEvents, null, 2), 'utf-8');
}


// Participant CRUD
export async function getParticipants(): Promise<Participant[]> {
    await ensureDataDir();
    return readJsonFile(PARTICIPANTS_FILE);
}


export async function addParticipant(participant: Participant): Promise<void> {
    const participants = await getParticipants();
    // Check for duplicates
    const exists = participants.some(p => p.eventId === participant.eventId && p.userId === participant.userId);
    if (exists) {
        throw new Error('User is already participating in this event.');
    }
    participants.push(participant);
    await fs.writeFile(PARTICIPANTS_FILE, JSON.stringify(participants, null, 2), 'utf-8');
}

export async function getEventParticipants(eventId: string): Promise<User[]> {
    const participants = await getParticipants();
    const eventParticipants = participants.filter((p) => p.eventId === eventId);
    const userIds = eventParticipants.map((p) => p.userId);
    const users = await getUsers();
    return users.filter((u) => userIds.includes(u.id));
}

export async function removeParticipant(eventId: string, userId: string): Promise<void> {
    const participants = await getParticipants();
    const filteredParticipants = participants.filter(p => !(p.eventId === eventId && p.userId === userId));
    await fs.writeFile(PARTICIPANTS_FILE, JSON.stringify(filteredParticipants, null, 2), 'utf-8');
}
