# Artsdata Reconciliation Service

A [W3C Entity Reconciliation API](https://www.w3.org/community/reconciliation/) compliant service for matching and reconciling cultural data against the [Artsdata Knowledge Graph](https://artsdata.ca). This service enables data integration workflows for cultural organizations, allowing them to match their event, organization, person, place, and other entity data against Artsdata's authoritative cultural database.

Built with [NestJS](https://nestjs.com), this service provides a robust and scalable reconciliation endpoint compatible with tools like [OpenRefine](https://openrefine.org/).

## Features

- **W3C Reconciliation API Compliant**: Full support for the W3C Entity Reconciliation API specification
- **Multiple Entity Types**: Reconcile events, organizations, people, places, agents, concepts, and more
- **Batch Reconciliation**: Process multiple entities in a single request
- **GraphDB Integration**: Direct connection to Artsdata's GraphDB instance
- **OpenAPI/Swagger Documentation**: Interactive API documentation available at `/api`
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Heroku Ready**: Configured for seamless Heroku deployment

## Prerequisites

- **Node.js**: ^22.17.0
- **npm**: ^10.9.2
- **Docker** (optional): For containerized deployment
- **GraphDB**: Access to an Artsdata GraphDB instance (or use staging)

## Environment Variables

The application uses the following environment variables. Create a `.env` file in the root directory based on `.env.sample`:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `ENVIRONMENT` | Deployment environment (staging/production) | `staging` |
| `PORT` | HTTP port for the server | `3000` |
| `ARTSDATA_ENDPOINT` | GraphDB endpoint URL | `https://staging.db.artsdata.ca/` |
| `REPOSITORY` | GraphDB repository name | `artsdata` |
| `ARTSDATA_USER` | GraphDB username (optional) | - |
| `ARTSDATA_PASSWORD` | GraphDB password (optional) | - |
| **Index Configuration** | | |
| `EVENT` | Event entity index name | `event-index` |
| `ENTITY` | General entity index name | `entity-index` |
| `PLACE` | Place entity index name | `place-index` |
| `ORGANIZATION` | Organization entity index name | `organization-index` |
| `PERSON` | Person entity index name | `person-index` |
| `AGENT` | Agent entity index name | `agent-index` |
| `CONCEPT` | Concept entity index name | `concept-index` |
| `EVENT_TYPE` | Event type index name | `event-type-index` |
| `LIVE_PERFORMANCE_WORK` | Live performance work index name | `live-performance-work-index` |
| `DEFAULT` | Default resource index name | `resource-index` |
| `PROPERTY` | Property index name | `property-index` |
| `TYPE` | Type index name | `type-index` |
| `LABELLED_ENTITIES` | Labeled entities index name | `all-literals` |
| **Feature Flags** | | |
| `ENABLE_EVENT_BATCH_RECONCILIATION` | Enable batch reconciliation for events | `true` |
| `LOG_QUERIES` | Enable query logging for debugging | `true` |

### Setting Up Environment Variables

1. Copy the sample environment file:
   ```bash
   cp .env.sample .env
   ```

2. Edit `.env` and update the values as needed for your environment.

## Installation

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/culturecreates/artsdata-reconciliation.git
   cd artsdata-reconciliation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.sample .env
   # Edit .env with your configuration
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Start the application**:
   ```bash
   # Development mode with hot-reload
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

6. **Access the application**:
   - API: `http://localhost:3000`
   - Swagger Documentation: `http://localhost:3000/api`

## Docker Deployment

### Using Docker Compose (Recommended)

Docker Compose provides the easiest way to run the application in a containerized environment:

```bash
# Build and start the container
docker-compose up --build

# Run in detached mode (background)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3000`.

### Using Docker Directly

If you prefer to use Docker without Docker Compose:

```bash
# Build the Docker image
docker build -t artsdata-reconciliation .

# Run the container
docker run -p 3000:3000 --env-file .env artsdata-reconciliation

# Or with environment variables directly
docker run -p 3000:3000 \
  -e ARTSDATA_ENDPOINT=https://staging.db.artsdata.ca/ \
  -e REPOSITORY=artsdata \
  artsdata-reconciliation
```

## Heroku Deployment

This application is configured for deployment on Heroku with the included `Procfile`.

### Prerequisites for Heroku

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- A Heroku account

### Deployment Steps

1. **Login to Heroku**:
   ```bash
   heroku login
   ```

2. **Create a Heroku application**:
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables on Heroku**:
   ```bash
   # Set required environment variables
   heroku config:set ENVIRONMENT=production
   heroku config:set ARTSDATA_ENDPOINT=https://db.artsdata.ca/
   heroku config:set REPOSITORY=artsdata
   
   # Set optional credentials if needed
   heroku config:set ARTSDATA_USER=your_username
   heroku config:set ARTSDATA_PASSWORD=your_password
   
   # Set feature flags
   heroku config:set ENABLE_EVENT_BATCH_RECONCILIATION=true
   heroku config:set LOG_QUERIES=false
   
   # View all configured variables
   heroku config
   ```

4. **Deploy to Heroku**:
   ```bash
   # Deploy from main branch
   git push heroku main
   
   # Or deploy from a different branch
   git push heroku your-branch:main
   ```

5. **Open your application**:
   ```bash
   heroku open
   ```

6. **View logs**:
   ```bash
   # Stream logs in real-time
   heroku logs --tail
   
   # View recent logs
   heroku logs --num 200
   ```

### Heroku Configuration Notes

- The `Procfile` is configured to run `npm run start:prod`
- Heroku automatically sets the `PORT` environment variable
- Node.js version is specified in `package.json` engines field
- The buildpack will automatically detect and use Node.js

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

```


## API Documentation

Once the application is running, you can access the interactive API documentation:

- **Swagger UI**: `http://localhost:3000/api`

The API follows the [W3C Entity Reconciliation API specification](https://www.w3.org/community/reconciliation/):
- [W3C Entity Reconciliation Community Group](https://www.w3.org/community/reconciliation/)
- [Reconciliation API Specs](https://reconciliation-api.github.io/specs/latest/)
- [List of known public endpoints](https://reconciliation-api.github.io/testbench/)

## Technology Stack

- **[Node.js](https://nodejs.org)** - JavaScript runtime built on Chrome's V8 engine
- **[NestJS](https://nestjs.com)** - Progressive Node.js framework for scalable server-side applications
- **[TypeScript](https://www.typescriptlang.org/)** - Typed superset of JavaScript
- **[GraphDB](https://graphdb.ontotext.com/)** - Semantic graph database for RDF and SPARQL
- **[Docker](https://www.docker.com/)** - Containerization platform
- **[Swagger/OpenAPI](https://swagger.io/)** - API documentation and testing

## Project Structure

```
artsdata-reconciliation/
├── src/
│   ├── config/          # Configuration files
│   ├── controller/      # API controllers
│   ├── service/         # Business logic services
│   ├── dto/             # Data Transfer Objects
│   ├── enum/            # Enumerations
│   ├── interface/       # TypeScript interfaces
│   ├── helper/          # Helper utilities
│   └── main.ts          # Application entry point
├── test/                # Test files
├── seed/                # Database seeding scripts
├── graph-db/            # GraphDB configuration
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── Procfile             # Heroku process configuration
└── .env.sample          # Sample environment variables
```

## Troubleshooting

### Connection Issues

If you encounter connection issues with GraphDB:

1. Verify your `ARTSDATA_ENDPOINT` is correct
2. Check if authentication is required (set `ARTSDATA_USER` and `ARTSDATA_PASSWORD`)
3. Ensure network connectivity to the GraphDB instance
4. Check the application logs for detailed error messages

### Port Already in Use

If port 3000 is already in use:

```bash
# Set a different port
export PORT=3001
npm run start

# Or in .env file
PORT=3001
```

### Docker Issues

If Docker containers fail to start:

```bash
# Remove existing containers and rebuild
docker-compose down
docker-compose up --build

# View detailed logs
docker-compose logs -f
```

## Support

For questions and support:
- **W3C Community Group**: [public-reconciliation@w3.org](mailto:public-reconciliation@w3.org)
- **Artsdata**: [https://artsdata.ca](https://artsdata.ca)
- **GitHub Issues**: [Report an issue](https://github.com/culturecreates/artsdata-reconciliation/issues)

## Acknowledgments

- [W3C Entity Reconciliation Community Group](https://www.w3.org/community/reconciliation/)
- [Artsdata.ca](https://artsdata.ca)
- [NestJS](https://nestjs.com)
