import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {ExpressAdapter} from '@nestjs/platform-express';
import {AppModule} from './app.module';
import {APPLICATION} from './config';
import * as express from 'express';
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
        .setTitle('Reconciliation API - OpenAPI 3.1')
        .setDescription(
            `Web API letting clients match data against a database hosted by the service.<br>
       Some useful links:<br>
       - [W3C Entity Reconciliation Community Group](https://www.w3.org/community/reconciliation/)<br>
       - [Source code for Reconciliation API](https://github.com/reconciliation-api/specs)<br>
       - [List of known public endpoints](https://reconciliation-api.github.io/testbench/)<br>
       - [OpenRefine wiki list of reconcilable data sources](https://github.com/OpenRefine/OpenRefine/wiki/Reconciliable-Data-Sources)`
        )
        .setVersion('0.0.1')
        .setContact(
            'W3C Entity Reconciliation Community Group',
            'https://www.w3.org/community/reconciliation/',
            'public-reconciliation@w3.org'
        )
        .setLicense(
            'W3C Community Final Specification Agreement (FSA)',
            'https://www.w3.org/community/about/process/fsa-deed/'
        )
        .setExternalDoc('Find out more about Reconciliation API', 'https://reconciliation-api.github.io')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
    http.createServer(server).listen(APPLICATION.HTTP_PORT, () => {
        console.log(`Server running on port ${APPLICATION.HTTP_PORT}`);
    });
}

bootstrap();