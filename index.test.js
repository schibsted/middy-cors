test('Middleware returns all 2 handlers', () => {
    const middleware = require('./index')();

    expect(middleware.after).toBeInstanceOf(Function);
    expect(middleware.onError).toBeInstanceOf(Function);
});

test('Does nothing if has no config', async () => {
    const middleware = require('./index')();

    const payload = {
        event: {
            headers: {
                host: 'localhost:3000',
                connection: 'keep-alive',
                'upgrade-insecure-requests': '1',
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pl;q=0.7,nb;q=0.6,no;q=0.5',
            },
            httpMethod: 'GET',
            path: '/foobar',
        },
        response: {
            statusCode: 200,
        },
    };

    await middleware.after(payload);

    expect(payload).toMatchSnapshot();
});

test('Adds CORS headers on success', async () => {
    const middleware = require('./index')({
        // This configuration is mirrored in serverless.cors.yml
        allowedOrigins: ['https://www.vg.no', 'https://www.tek.no'],
        exposeHeaders: ['x-my-header'],
        maxAge: 2628000, // 1 month
        credentials: true,
        allowMethods: ['GET', 'POST'],
        allowHeaders: ['Content-Type', 'Accept', 'X-Forwarded-For'],
    });

    const payload = {
        event: {
            headers: {
                host: 'localhost:3000',
                connection: 'keep-alive',
                'upgrade-insecure-requests': '1',
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pl;q=0.7,nb;q=0.6,no;q=0.5',
            },
            httpMethod: 'GET',
            path: '/foobar',
        },
        response: {
            statusCode: 200,
        },
    };

    await middleware.after(payload);

    expect(payload).toMatchSnapshot();
});

test('Adds CORS headers on error', async () => {
    const middleware = require('./index')({
        // This configuration is mirrored in serverless.cors.yml
        allowedOrigins: ['https://www.vg.no', 'https://www.tek.no'],
        exposeHeaders: ['x-my-header'],
        maxAge: 2628000, // 1 month
        credentials: false,
        allowMethods: ['GET', 'POST'],
        allowHeaders: ['Content-Type', 'Accept', 'X-Forwarded-For'],
    });

    const payload = {
        event: {
            headers: {
                host: 'localhost:3000',
                connection: 'keep-alive',
                'upgrade-insecure-requests': '1',
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pl;q=0.7,nb;q=0.6,no;q=0.5',
            },
            httpMethod: 'GET',
            path: '/foobar',
        },
        response: {
            statusCode: 500,
        },
    };

    await middleware.onError(payload);

    expect(payload).toMatchSnapshot();
});
