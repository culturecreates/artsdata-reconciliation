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
    app.useGlobalPipes(new ValidationPipe());
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
            `<p>Web API letting clients match, extend, preview and get suggestions for reconciling data against the Artsdata knowledge graph.</p>
        <p> This API conforms to the W3C Reconciliation API Specification v1.0.</p>
        <p> Some useful links: 
        <ul>
        <li> [W3C Reconciliation API Spec v1.0](https://reconciliation-api.github.io/specs/1.0-draft/)</li>
        <li> [W3C Reconciliation API Test bench](https://reconciliation-api.github.io/testbench/1.0/#/client/https%3A%2F%2Frecon.artsdata.ca)</li>
        <li> [W3C Entity Reconciliation Community Group](https://www.w3.org/community/reconciliation/)</li>
        </ul>`
        )
        .setVersion('1.0.1')
        .setContact(
            'W3C Entity Reconciliation Community Group',
            'https://www.w3.org/community/reconciliation/',
            'public-reconciliation@w3.org'
        )
        .setLicense(
            'W3C Community Final Specification Agreement (FSA)',
            'https://www.w3.org/community/about/process/fsa-deed/'
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
    http.createServer(server).listen(APPLICATION.HTTP_PORT, () => {
        console.log(`Server running on port ${APPLICATION.HTTP_PORT}`);
    });
}

bootstrap();