import { Injectable } from "@nestjs/common";
import * as MANIFEST from "../../constant/manifest.constant.json";
import { ServiceManifestResponse } from "../../dto";

@Injectable()
export class ManifestService {
  getServiceManifest(): ServiceManifestResponse {
    return MANIFEST;
  }
}
