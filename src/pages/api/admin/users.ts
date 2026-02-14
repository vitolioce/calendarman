import type { APIRoute } from 'astro';
import { getUsers, deleteUser, saveUser, findUserByEmail } from '../../../lib/db';
import type { User } from '../../../types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// GET - Lista tutti gli utenti (solo admin)
export const GET: APIRoute = async ({ locals }) => {
    try {
        const user = locals.user as User | undefined;

        if (!user || !user.isAdmin) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
        }

        const users = await getUsers();
        // Rimuovi passwordHash dalla risposta per sicurezza
        const safeUsers = users.map(({ passwordHash, ...rest }) => rest);

        return new Response(JSON.stringify(safeUsers), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};

// POST - Crea un nuovo utente (solo admin)
export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const user = locals.user as User | undefined;

        if (!user || !user.isAdmin) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
        }

        const data = await request.json();
        const { email, password, nome, cognome, isAdmin } = data;

        if (!email || !password || !nome || !cognome) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return new Response(JSON.stringify({ error: 'User already exists' }), { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser: User = {
            id: uuidv4(),
            email,
            passwordHash,
            nome,
            cognome,
            isAdmin: isAdmin || false,
        };

        await saveUser(newUser);

        return new Response(JSON.stringify({
            message: 'User created successfully',
            user: { id: newUser.id, email: newUser.email, nome: newUser.nome, cognome: newUser.cognome, isAdmin: newUser.isAdmin }
        }), { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};

// DELETE - Elimina un utente (solo admin)
export const DELETE: APIRoute = async ({ request, locals }) => {
    try {
        const user = locals.user as User | undefined;

        if (!user || !user.isAdmin) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
        }

        const data = await request.json();
        const { userId } = data;

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
        }

        // Impedisci all'admin di eliminare se stesso
        if (userId === user.id) {
            return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), { status: 400 });
        }

        await deleteUser(userId);

        return new Response(JSON.stringify({ message: 'User deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
