const R = require('ramda');

const getCorsHeaders = ({ allowedOrigins, exposeHeaders, maxAge, credentials, allowMethods, allowHeaders } = {}) => {
    const headers = {};

    if (allowedOrigins) {
        headers['access-control-allow-origin'] = allowedOrigins.join(', ');
    }

    if (credentials !== undefined) {
        headers['access-control-allow-credentials'] = credentials;
    }

    if (exposeHeaders) {
        headers['access-control-expose-headers'] = exposeHeaders.join(', ');
    }
    if (maxAge !== undefined) {
        headers['access-control-max-age'] = maxAge;
    }
    if (allowMethods) {
        headers['access-control-allow-methods'] = allowMethods.join(', ');
    }
    if (allowHeaders) {
        headers['access-control-allow-headers'] = allowHeaders.join(', ');
    }

    return headers;
};

const corsMiddleware = (opts) => ({
    after: async (handler) => {
        // eslint-disable-next-line no-param-reassign
        handler.response.headers = {
            ...handler.response.headers,
            ...getCorsHeaders(opts),
        };
    },
    onError: async (handler) => {
        // eslint-disable-next-line no-param-reassign
        handler.response = R.assocPath(
            ['headers'],
            {
                ...R.pathOr({}, ['response', 'headers'], handler),
                ...getCorsHeaders(opts),
            },
            handler.response
        );

        return handler;
    },
});

module.exports = corsMiddleware;
