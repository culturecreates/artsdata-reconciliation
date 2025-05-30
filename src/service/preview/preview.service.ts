import { Injectable } from "@nestjs/common";
import { PREVIEW_QUERY } from "../../constant/preview/preview-queries.constants";
import { ArtsdataConstants } from "../../constant";
import { ArtsdataService } from "../artsdata";
import { PREVIEW_HTML } from "../../constant/preview/preview-html.constants";

@Injectable()
export class PreviewService {

  constructor(private readonly _artsdataService: ArtsdataService) {
  }

  async getPreview(entityId: string): Promise<string> {
    const uri: string = `${ArtsdataConstants.PREFIX}${entityId}`;
    const sparqlQuery = this._generateSparqlQuery(uri);
    const result = await this._artsdataService.executeSparqlQuery(sparqlQuery);
    return this.formatResult(uri ,entityId, result);
  }

  private _generateSparqlQuery(uri: string) {
    return PREVIEW_QUERY.replace("URI_PLACE_HOLDER" , uri);
  }

  private formatResult(uri: string ,entityId:string, result: any) {
    const row = result.results.bindings?.[0];
    let name , description , typeLabels , image;
    if (row) {
      name = row.name?.value;
      description = row.description?.value;
      typeLabels = row.typeLabels?.value;
      image = row.image?.value;
      return this._generateHtmlContent(uri ,entityId, name , description , typeLabels , image);
    }
    return this._generateErrorPage(uri, entityId);
  }

  private _generateHtmlContent(uri: string , entityId:string, name: any , description: any , typeLabels: any , image: any) {
    const body = `<div class="container">
      ${image? `<div class="image-wrapper"> <img src=${image} alt="${name}"> </div> `:""} 
    
    <div class="details-wrapper">
        <a href="${uri}" target="_blank">${name}</a> <span class="id-code">(${entityId})</span>
        <p>${typeLabels || ""}</p>
        <p>${description || ""}</p>
    </div>
</div>`
    return PREVIEW_HTML.replace("NAME_PLACE_HOLDER",typeLabels).replace("BODY_PLACE_HOLDER", body);
  }

  private _generateErrorPage(uri: string , entityId: string) {
    const body = `<div class="container">
        <div class="details-wrapper">
        <h3 align="center">Preview Unavailable</h3>
        <p align="center">The entity <a href="${uri}" >${entityId}</a> is not in the Artsdata database</p>
    </div>
    </div>`
    return PREVIEW_HTML.replace("BODY_PLACE_HOLDER", body);
  }
}
