import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { APPLICATION } from "./config/system.config";
import * as express from "express";
import * as http from "http";
import * as fs from "node:fs";
import * as https from "node:https";


async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync("./secrets/private-key.pem"),
    cert: fs.readFileSync("./secrets/public-certificate.pem")
  };

  const server = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server)
  );

  const config = new DocumentBuilder()
    .setTitle("Reconciliation API - OpenAPI 3.1")
    .setDescription("Web API letting clients match data against a database hosted by the service.<br>" +
      "    Some useful links:<br>" +
      "      - [ W3C Entity Reconciliation Community Group ](https://www.w3.org/community/reconciliation/)<br>" +
      "      - [ Source code for Reconciliation API ](https://github.com/reconciliation-api/specs)<br>" +
      "      - [ List of known public endpoints ](https://reconciliation-api.github.io/testbench/)<br>" +
      "      - [ OpenRefine wiki list of reconcilable data sources ](https://github.com/OpenRefine/OpenRefine/wiki/Reconciliable-Data-Sources)")
    .setVersion("0.0.1")
    .setContact("W3C Entity Reconciliation Community Group", "https://www.w3.org/community/reconciliation/",
      "public-reconciliation@w3.org")
    .setLicense("W3C Community Final Specification Agreement (FSA)",
      " https://www.w3.org/community/about/process/fsa-deed/")
    .setExternalDoc("Find out more about Reconciliation API", "https://reconciliation-api.github.io")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  app.enableCors();
  await app.init();
  http.createServer(server).listen(APPLICATION.HTTP_PORT);
  https.createServer(httpsOptions, server).listen(APPLICATION.HTTPS_PORT);

}

bootstrap();
