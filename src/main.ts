import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {ExpressAdapter} from '@nestjs/platform-express';
import {AppModule} from './app.module';
import {APPLICATION} from './config';
import express from 'express';
import * as http from 'http';
import {ValidationPipe} from '@nestjs/common';
import {ArtsdataService} from './service';

async function bootstrap() {
    const server = express();
    server.use(express.json({limit: '50mb'}));
    server.use(express.urlencoded({limit: '50mb', extended: true}));

    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.useGlobalPipes(new ValidationPipe(
        {transform: true}
    ));
    app.enableCors();

    const artsdataService = app.get(ArtsdataService);
    console.log('Checking connection to GraphDB before starting the app...');

    const ok = await artsdataService.checkConnectionWithRetry();
    if (!ok) {
        console.error('Unable to connect to GraphDB after retries. Stopping application.');
        await app.close();
        process.exit(1);
    }

    console.log('GraphDB connection verified. Starting NestJS application...');

    const config = new DocumentBuilder()
        .setTitle('Artsdata Reconciliation API')
        .setDescription(
`This Web API provides match, extend, preview and suggest services for reconciling data against the Artsdata knowledge graph.
    
This API conforms to the W3C Reconciliation API Specification v1.0.

Some useful links: 

- [W3C Reconciliation API Spec v1.0](https://reconciliation-api.github.io/specs/1.0-draft/)
- [W3C Reconciliation API Test Bench](https://reconciliation-api.github.io/testbench/1.0/#/client/https%3A%2F%2Frecon.artsdata.ca)
- [W3C Entity Reconciliation Community Group](https://www.w3.org/community/reconciliation/)
`
        )
        .setVersion('1.0.2')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
    http.createServer(server).listen(APPLICATION.HTTP_PORT, () => {
        console.log(`Server running on port ${APPLICATION.HTTP_PORT}`);
    });
}

bootstrap();