import { Injectable } from "@nestjs/common";
import { PREVIEW_QUERY } from "../../constant/preview/preview-queries.constants";
import { ArtsdataConstants } from "../../constant";
import { ArtsdataService } from "../artsdata";
import { Exception } from "../../helper";

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
    throw Exception.notFound("The entity id does not exists");
  }

  private _generateHtmlContent(uri: string , entityId:string, name: any , description: any , typeLabels: any , image: any) {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            height: 200px;
            width: 400px;
            overflow: hidden;
            font-size: 0.9em;
            display: flex;
            align-items: center;
            border: 1px solid #ddd;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
            padding: 10px;
            box-sizing: border-box;
        }
        .image-wrapper {
            width: 100px;
            text-align: center;
            overflow: hidden;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .image-wrapper img {
            height: 100px;
            width: auto;
            display: block;
        }
        .details-wrapper {
            flex-grow: 1;
            /* Add this for wrapping long text */
            word-wrap: break-word; /* For older browsers */
            overflow-wrap: break-word; /* Modern standard */
        }
        .details-wrapper a {
            text-decoration: none;
            color: #007bff;
            font-weight: bold;
            font-size: 1.1em;
        }
        .details-wrapper a:hover {
            text-decoration: underline;
        }
        .details-wrapper .id-code {
            color: #777;
            font-size: 0.9em;
            margin-left: 5px;
        }
        .details-wrapper p {
            margin: 1px 0 0 0;
            color: #555;
        }
    </style>
</head>
<body>

<div class="container">
   <div class="image-wrapper">
    ${image ? `<img src=${image} alt="${name}">` : "" }
    </div> 
    
    <div class="details-wrapper">
        <a href="${uri}" target="_blank">${name}</a> <span class="id-code">(${entityId})</span>
        <p>${typeLabels || ""}</p>
        <p>${description || ""}</p>
    </div>
</div>

</body>
</html>`;
  }
}
