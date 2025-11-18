import { Injectable } from "@nestjs/common";
import { ServiceManifestResponse } from "../../dto";
import {MANIFEST} from "../../constant";

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
