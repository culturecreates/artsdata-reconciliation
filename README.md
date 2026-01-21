# Artsdata.ca Reconciliation Service

This project is based on the [NestJS].

### Technical Details

- [NodeJS] - A JavaScript runtime built on Chrome's V8 JavaScript engine.
- [NestJS] - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- [Docker] - Empowering App Development for Developers.

### Requirements

- [Npm]: ≥ 7.9.0.
- [NodeJS]: > 14.15.5.

### Installation

```

# Build and 'compose-up' the docker.
docker-compose up --build

```

# Seeding the calendar metadata.
Build the application

npm run build

npm run seed:calendar-metadata

# Run unit test.

npm run test

## React Match Demo

A React widget demo is included to demonstrate how to integrate with the Artsdata Reconciliation API. The demo provides a place search interface with the following features:

- Real-time search with debouncing (max 1 request per second)
- Display of up to 10 matching results
- Bootstrap UI styling
- Full unit test coverage

### Accessing the Demo

Once the server is running, the demo is accessible at:
- **Development:** `http://localhost:3000/demo`
- **Production:** `https://recon.artsdata.ca/demo`

### Building the Demo

The demo is automatically built when you run:

```bash
npm run build
```

To build only the demo:

```bash
npm run build:demo
```

### Testing the Demo

To run the demo's unit tests:

```bash
npm run test:demo
```

### Demo Documentation

For detailed documentation on how to use and customize the React widget, see:
- [Demo README](./demo/react-match-demo/README.md)

#### And you're ready to go :)

[nestjs]: https://nestjs.com
[nodejs]: https://nodejs.org
[docker]: https://www.docker.com/
[npm]: https://www.npmjs.com/