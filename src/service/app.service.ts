import { Injectable } from "@nestjs/common";
import * as MANIFEST from "../constant/manifest.constant.json";
import { ServiceManifestResponse } from "../dto/manifest.dto";

@Injectable()
export class AppService {
  getServiceManifest(): ServiceManifestResponse {
    return MANIFEST;
  }
}
