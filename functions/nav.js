export async function onRequestGet(context) {
    const appKey = context.request.headers.get('appKey');
    const data = await context.env.GPage.get(appKey);
    return new Response(data || '[]', {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPost(context) {
    const appKey = context.request.headers.get('appKey');
    const data = await context.env.GPage.get(appKey);
    if (data === null) {
        return new Response('Unauthorized', { status: 401 });
    } else {
        const body = await context.request.text();
        await context.env.GPage.put(appKey, body);
        return new Response('OK');
    }
}
