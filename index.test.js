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

    const event = {
        event: {
            headers: {
                host: 'localhost:3000',
                connection: 'keep-alive',
                'upgrade-insecure-requests': '1',
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                accept:
                    'text/html,application/xhtmlxml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pl;q=0.7,nb;q=0.6,no;q=0.5',
            },
            httpMethod: 'GET',
            path: '/foobar',
        },
    };

    const response = await handler(event, {});
    expect(response).toEqual({
        statusCode: 200,
        headers: {
            someHeader: 'someValue',
        },
        body: JSON.stringify({ foo: 'bar' }),
    });
});

test('Adds CORS headers on success', async () => {
    const handler = middy(async () => ({
        statusCode: 200,
        body: JSON.stringify({ foo: 'bar' }),
        headers: {
            someHeader: 'someValue',
        },
    }));

    handler.use(
        middleware({
            // This configuration is mirrored in serverless.cors.yml
            allowedOrigins: ['https://www.vg.no', 'https://www.tek.no'],
            exposeHeaders: ['x-my-header'],
            maxAge: 2628000, // 1 month
            credentials: true,
            allowMethods: ['GET', 'POST'],
            allowHeaders: ['Content-Type', 'Accept', 'X-Forwarded-For'],
        })
    );

    const event = {
        event: {
            headers: {
                host: 'localhost:3000',
                connection: 'keep-alive',
                'upgrade-insecure-requests': '1',
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                accept:
                    'text/html,application/xhtmlxml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pl;q=0.7,nb;q=0.6,no;q=0.5',
            },
            httpMethod: 'GET',
            path: '/foobar',
        },
    };

    const response = await handler(event, {});
    expect(response).toEqual({
        statusCode: 200,
        headers: {
            'access-control-allow-credentials': true,
            'access-control-allow-headers': 'Content-Type, Accept, X-Forwarded-For',
            'access-control-allow-methods': 'GET, POST',
            'access-control-allow-origin': 'https://www.vg.no, https://www.tek.no',
            'access-control-expose-headers': 'x-my-header',
            'access-control-max-age': 2628000,
            someHeader: 'someValue',
        },
        body: JSON.stringify({ foo: 'bar' }),
    });
});

test('Adds CORS headers on error', async () => {
    const handler = middy(async () => {
        throw new createError.InternalServerError('whoops');
    });

    handler.use(
        middleware({
            // This configuration is mirrored in serverless.cors.yml
            allowedOrigins: ['https://www.vg.no', 'https://www.tek.no'],
            exposeHeaders: ['x-my-header'],
            maxAge: 2628000, // 1 month
            credentials: true,
            allowMethods: ['GET', 'POST'],
            allowHeaders: ['Content-Type', 'Accept', 'X-Forwarded-For'],
        })
    );

    const event = {
        event: {
            headers: {
                host: 'localhost:3000',
                connection: 'keep-alive',
                'upgrade-insecure-requests': '1',
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                accept:
                    'text/html,application/xhtmlxml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pl;q=0.7,nb;q=0.6,no;q=0.5',
            },
            httpMethod: 'GET',
            path: '/foobar',
        },
    };

    await expect(handler(event, {})).rejects.toEqual(
        expect.objectContaining({
            response: {
                headers: {
                    'access-control-allow-credentials': true,
                    'access-control-allow-headers': 'Content-Type, Accept, X-Forwarded-For',
                    'access-control-allow-methods': 'GET, POST',
                    'access-control-allow-origin': 'https://www.vg.no, https://www.tek.no',
                    'access-control-expose-headers': 'x-my-header',
                    'access-control-max-age': 2628000,
                },
            },
        })
    );
});

test('Keep headers already present in the response on error', async () => {
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
            // This configuration is mirrored in serverless.cors.yml
            allowedOrigins: ['https://www.vg.no', 'https://www.tek.no'],
            exposeHeaders: ['x-my-header'],
            maxAge: 2628000, // 1 month
            credentials: true,
            allowMethods: ['GET', 'POST'],
            allowHeaders: ['Content-Type', 'Accept', 'X-Forwarded-For'],
        })
    );

    const event = {
        event: {
            headers: {
                host: 'localhost:3000',
                connection: 'keep-alive',
                'upgrade-insecure-requests': '1',
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                accept:
                    'text/html,application/xhtmlxml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pl;q=0.7,nb;q=0.6,no;q=0.5',
            },
            httpMethod: 'GET',
            path: '/foobar',
        },
    };

    await expect(handler(event, {})).rejects.toEqual(
        expect.objectContaining({
            response: {
                headers: {
                    'access-control-allow-credentials': true,
                    'access-control-allow-headers': 'Content-Type, Accept, X-Forwarded-For',
                    'access-control-allow-methods': 'GET, POST',
                    'access-control-allow-origin': 'https://www.vg.no, https://www.tek.no',
                    'access-control-expose-headers': 'x-my-header',
                    'access-control-max-age': 2628000,
                    someHeader: 'someValue',
                },
            },
        })
    );
});
