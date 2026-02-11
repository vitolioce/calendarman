import { defineMiddleware } from 'astro/middleware';
import { getUsers } from './lib/db';

export const onRequest = defineMiddleware(async (context, next) => {
    const { cookies, locals } = context;
    const sessionUser = cookies.get('session_user_id');

    if (sessionUser?.value) {
        const users = await getUsers();
        const user = users.find((u) => u.id === sessionUser.value);
        if (user) {
            locals.user = user;
        } else {
            // Invalid session - clear it
            cookies.delete('session_user_id', { path: '/' });
        }
    }

    return next();
});
