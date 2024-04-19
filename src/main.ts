import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { APPLICATION } from "./config/system.config";
import * as express from "express";
import * as fs from "fs";
import * as http from "http";
import * as https from "https";



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
    .setTitle("Artsdata.ca Reconciliation Service")
    .setDescription("Artsdata.ca Reconciliation Service APIs")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  app.enableCors();
  await app.init();
  // http.createServer(server).listen(APPLICATION.HTTP_PORT);
  https.createServer(httpsOptions, server).listen(APPLICATION.HTTPS_PORT);

}

bootstrap();
