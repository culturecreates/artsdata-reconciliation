import { Test, TestingModule } from "@nestjs/testing";
import { ManifestController } from "./manifest.controller";
import { ManifestService } from "../../service";
import {MANIFEST} from "../../constant";

describe('ManifestController', () => {
  let manifestController: ManifestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ManifestController],
      providers: [ManifestService]
    }).compile();

    manifestController = app.get<ManifestController>(ManifestController);
  });

  describe("manifest", () => {
    it("should return Service Manifest", () => {
      expect(manifestController.getServiceManifest()).toBe(MANIFEST);
    });
  });
});