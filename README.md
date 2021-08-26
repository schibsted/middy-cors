# Schibsted Middy CORS middleware

#### CORS middleware for the middy framework, the stylish Node.js middleware engine for AWS Lambda


This middleware sets HTTP CORS headers, necessary for making cross-origin requests, to the response object.

Sets headers in `after` and `onError` phases.

This is an alternative to [standard Middy cors handler](https://github.com/middyjs/middy/tree/master/packages/http-cors) with the following differences:
- it allows you to add more CORS headers


## Install

To install this middleware you can use NPM:

```bash
npm install --save @schibsted/middy-cors
```


## Options

- `allowedOrigins` (array) - list of allowed origins or `['*']` for allowing all origins
- `exposeHeaders` (array) - list of headers to expose
- `maxAge` (string) - value passed to `access-control-max-age` header
- `credentials` (bool) - value passed to `access-control-allow-credentials` header 
- `allowMethods` (array) - list of allowed HTTP methods
- `allowHeaders` (array) - list of allowed HTTP headers


## Sample usage

```javascript
const middy = require('@middy/core');
const cors = require('@schibsted/middy-cors');

const handler = middy(async () => ({
        statusCode: 200,
        body: JSON.stringify({ foo: 'bar' }),
    }));

handler
  .use(cors({ allowedOrigins: ['https://www.vg.no', 'https://www.tek.no']}));

// when Lambda runs the handler...
handler({}, {}, (_, response) => {
  expect(response).toEqual({
    statusCode: 200,
    headers: {
        'access-control-allow-origin': 'https://www.vg.no',
    },
    body: JSON.stringify({ foo: 'bar' }),
  })
})
```


## Contributing

Everyone is very welcome to contribute to this repository. Feel free to [raise issues](https://github.com/schibsted/middy-cors/issues) or to [submit Pull Requests](https://github.com/schibsted/middy-cors/pulls).
