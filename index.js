const R = require('ramda');

const getAllowedOrigin = (origin, allowedOrigins) => {
    if (R.includes('*', allowedOrigins)) {
        return origin;
    }

    return R.find((allowedOrigin) => allowedOrigin === origin, allowedOrigins);
};

const getCorsHeaders = (
    { allowedOrigins, exposeHeaders, maxAge, credentials, allowMethods, allowHeaders } = {},
    event
) => {
    const headers = {};

    if (allowedOrigins) {
        const origin = getAllowedOrigin(R.path(['headers', 'origin'], event), allowedOrigins);

        if (origin) {
            headers['access-control-allow-origin'] = origin;
        }
    }

    if (credentials !== undefined) {
        headers['access-control-allow-credentials'] = credentials;
    }

    if (!R.isNil(exposeHeaders) && !R.isEmpty(exposeHeaders)) {
        headers['access-control-expose-headers'] = exposeHeaders.join(', ');
    }
    if (maxAge !== undefined) {
        headers['access-control-max-age'] = maxAge;
    }
    if (!R.isNil(allowMethods) && !R.isEmpty(allowMethods)) {
        headers['access-control-allow-methods'] = allowMethods.join(', ');
    }
    if (!R.isNil(allowHeaders) && !R.isEmpty(allowHeaders)) {
        headers['access-control-allow-headers'] = allowHeaders.join(', ');
    }

    return headers;
};

const corsMiddleware = (opts) => ({
    after: async (handler) => {
        // eslint-disable-next-line no-param-reassign
        handler.response.headers = {
            ...handler.response.headers,
            ...getCorsHeaders(opts, handler.event),
        };
    },
    onError: async (handler) => {
        // eslint-disable-next-line no-param-reassign
        handler.response = R.assocPath(
            ['headers'],
            {
                ...R.pathOr({}, ['response', 'headers'], handler),
                ...getCorsHeaders(opts, handler.event),
            },
            handler.response
        );

        return handler;
    },
});

module.exports = corsMiddleware;
