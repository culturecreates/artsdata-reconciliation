import { Test, TestingModule } from '@nestjs/testing';
import { ManifestController } from './manifest.controller';
import { ManifestService } from '../../service/manifest/manifest.service';
import * as MANIFEST from "../../constant/manifest.constant.json";

describe('AppController', () => {
  let appController: ManifestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ManifestController],
      providers: [ManifestService],
    }).compile();

    appController = app.get<ManifestController>(ManifestController);
  });

  describe('root', () => {
    it('should return Service Manifest', () => {
      expect(appController.getServiceManifest()).toBe(MANIFEST);
    });
  });
});
