import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from '../service/app.service';
import * as MANIFEST from "../constant/manifest.constant.json";

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return Service Manifest', () => {
      expect(appController.getServiceManifest()).toBe(MANIFEST);
    });
  });
});
