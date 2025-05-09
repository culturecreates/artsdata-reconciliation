import { Injectable } from "@nestjs/common";
import * as MANIFEST from "../../constant/manifest.constant.json";
import { ServiceManifestResponse } from "../../dto";

@Injectable()
export class ManifestService {

  /**
   * @name getServiceManifest
   * @description Get service manifest
   * @returns {ServiceManifestResponse}
   */
  getServiceManifest(): ServiceManifestResponse {
    return MANIFEST;
  }
}
