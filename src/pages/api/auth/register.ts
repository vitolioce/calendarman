import type { APIRoute } from 'astro';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getUsers, saveUser, findUserByEmail, type User } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { email, password, nome, cognome } = data;

        if (!email || !password || !nome || !cognome) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return new Response(JSON.stringify({ error: 'User already exists' }), { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user: User = {
            id: uuidv4(),
            email,
            passwordHash,
            nome,
            cognome,
        };

        await saveUser(user);

        return new Response(JSON.stringify({ message: 'User registered successfully' }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
