const middy = require('@middy/core');
const createError = require('http-errors');
const middleware = require('./index');

test('Does nothing if has no config', async () => {
    const handler = middy(async () => ({
        statusCode: 200,
        body: JSON.stringify({ foo: 'bar' }),
        headers: {
            someHeader: 'someValue',
        },
    }));

    handler.use(middleware());

    const response = await handler({}, {});
    expect(response).toEqual({
        statusCode: 200,
        headers: {
            someHeader: 'someValue',
        },
        body: JSON.stringify({ foo: 'bar' }),
    });
});

test('Adds CORS headers on success from disallowed origin', async () => {
    const handler = middy(async () => ({
        statusCode: 200,
        body: JSON.stringify({ foo: 'bar' }),
        headers: {
            someHeader: 'someValue',
        },
    }));

    handler.use(
        middleware({
            allowedOrigins: ['https://www.vg.no', 'https://www.tek.no'],
            exposeHeaders: ['x-my-header'],
            maxAge: 2628000, // 1 month
            credentials: true,
            allowMethods: ['GET', 'POST'],
            allowHeaders: ['Content-Type', 'Accept', 'X-Forwarded-For'],
        })
    );

    const response = await handler(
        {
            headers: {
                origin: 'https://www.google.com',
            },
        },
        {}
    );
    expect(response).toEqual({
        statusCode: 200,
        headers: {
            'access-control-allow-credentials': true,
            'access-control-allow-headers': 'Content-Type, Accept, X-Forwarded-For',
            'access-control-allow-methods': 'GET, POST',
            'access-control-expose-headers': 'x-my-header',
            'access-control-max-age': 2628000,
            someHeader: 'someValue',
        },
        body: JSON.stringify({ foo: 'bar' }),
    });
});

test('Adds CORS headers on success from allowed origin', async () => {
    const handler = middy(async () => ({
        statusCode: 200,
        body: JSON.stringify({ foo: 'bar' }),
        headers: {
            someHeader: 'someValue',
        },
    }));

    handler.use(
        middleware({
            allowedOrigins: ['https://www.vg.no', 'https://www.tek.no'],
            exposeHeaders: ['x-my-header'],
            maxAge: 2628000, // 1 month
            credentials: true,
            allowMethods: ['GET', 'POST'],
            allowHeaders: ['Content-Type', 'Accept', 'X-Forwarded-For'],
        })
    );

    const response = await handler(
        {
            headers: {
                origin: 'https://www.tek.no',
            },
        },
        {}
    );
    expect(response).toEqual({
        statusCode: 200,
        headers: {
            'access-control-allow-credentials': true,
            'access-control-allow-headers': 'Content-Type, Accept, X-Forwarded-For',
            'access-control-allow-methods': 'GET, POST',
            'access-control-allow-origin': 'https://www.tek.no',
            'access-control-expose-headers': 'x-my-header',
            'access-control-max-age': 2628000,
            someHeader: 'someValue',
        },
        body: JSON.stringify({ foo: 'bar' }),
    });
});

test('Adds CORS headers on error from disallowed origin', async () => {
    const handler = middy(async () => {
        throw new createError.InternalServerError('whoops');
    });

    handler.use(
        middleware({
            allowedOrigins: ['https://www.vg.no', 'https://www.tek.no'],
            exposeHeaders: ['x-my-header'],
            maxAge: 2628000, // 1 month
            credentials: true,
            allowMethods: ['GET', 'POST'],
            allowHeaders: ['Content-Type', 'Accept', 'X-Forwarded-For'],
        })
    );

    await expect(
        handler(
            {
                headers: {
                    origin: 'https://www.google.com',
                },
            },
            {}
        )
    ).rejects.toEqual(
        expect.objectContaining({
            response: {
                headers: {
                    'access-control-allow-credentials': true,
                    'access-control-allow-headers': 'Content-Type, Accept, X-Forwarded-For',
                    'access-control-allow-methods': 'GET, POST',
                    'access-control-expose-headers': 'x-my-header',
                    'access-control-max-age': 2628000,
                },
            },
        })
    );
});

test('Adds CORS headers on error from allowed origin', async () => {
    const handler = middy(async () => {
        throw new createError.InternalServerError('whoops');
    });

    handler.use(
        middleware({
            allowedOrigins: ['https://www.vg.no', 'https://www.tek.no'],
            exposeHeaders: ['x-my-header'],
            maxAge: 2628000, // 1 month
            credentials: true,
            allowMethods: ['GET', 'POST'],
            allowHeaders: ['Content-Type', 'Accept', 'X-Forwarded-For'],
        })
    );

    await expect(
        handler(
            {
                headers: {
                    origin: 'https://www.tek.no',
                },
            },
            {}
        )
    ).rejects.toEqual(
        expect.objectContaining({
            response: {
                headers: {
                    'access-control-allow-credentials': true,
                    'access-control-allow-headers': 'Content-Type, Accept, X-Forwarded-For',
                    'access-control-allow-methods': 'GET, POST',
                    'access-control-allow-origin': 'https://www.tek.no',
                    'access-control-expose-headers': 'x-my-header',
                    'access-control-max-age': 2628000,
                },
            },
        })
    );
});

test('Keep headers already present in the response on error from disallowed origin', async () => {
    const handler = middy(async () => {
        throw new createError.InternalServerError('whoops');
    });

    // eslint-disable-next-line no-shadow
    handler.onError(async (handler) => {
        // eslint-disable-next-line no-param-reassign
        handler.response = {
            headers: {
                someHeader: 'someValue',
            },
        };

        return true;
    });

    handler.use(
        middleware({
            allowedOrigins: ['https://www.vg.no', 'https://www.tek.no'],
            exposeHeaders: ['x-my-header'],
            maxAge: 2628000, // 1 month
            credentials: true,
            allowMethods: ['GET', 'POST'],
            allowHeaders: ['Content-Type', 'Accept', 'X-Forwarded-For'],
        })
    );

    await expect(
        handler(
            {
                headers: {
                    origin: 'https://www.tek.no',
                },
            },
            {}
        )
    ).rejects.toEqual(
        expect.objectContaining({
            response: {
                headers: {
                    'access-control-allow-credentials': true,
                    'access-control-allow-headers': 'Content-Type, Accept, X-Forwarded-For',
                    'access-control-allow-methods': 'GET, POST',
                    'access-control-allow-origin': 'https://www.tek.no',
                    'access-control-expose-headers': 'x-my-header',
                    'access-control-max-age': 2628000,
                    someHeader: 'someValue',
                },
            },
        })
    );
});
