import { Test, TestingModule } from "@nestjs/testing";
import { ManifestController } from "./manifest.controller";
import * as MANIFEST from "../../constant/manifest.constant.json";
import { ManifestService } from "../../service";

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
