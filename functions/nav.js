export async function onRequestGet(context) {
    const data = await context.env.GPage.get('navJson');
    return new Response(data || '[]', {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPost(context) {
    const token = context.request.headers.get('Authorization');
    const auth = await context.env.GPage.get('auth');
    if (auth === token) {
        //return new Response('Unauthorized', { status: 401 });
        const body = await context.request.text();
        await context.env.GPage.put('navJson', body);
    }
    return new Response('OK');
}
