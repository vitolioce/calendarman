import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '../../../lib/db';

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const { email, password } = data;

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Missing email or password' }), { status: 400 });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        cookies.set('session_user_id', user.id, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return new Response(JSON.stringify({ message: 'Logged in successfully', user }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
