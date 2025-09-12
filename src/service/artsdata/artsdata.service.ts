import { Injectable } from "@nestjs/common";
import { ARTSDATA } from "../../config";
import { HttpService } from "../http";
import { Exception } from "../../helper";

@Injectable()
export class ArtsdataService {
  constructor(private readonly httpService: HttpService) {
  }

  /**
   * Constructs the Artsdata SPARQL endpoint URL.
   * @private
   */
  private _getArtsdataEndPoint(): string {
    const route = `repositories/${ARTSDATA.REPOSITORY}`;
    return new URL(route , ARTSDATA.ENDPOINT).toString();
  }

  /**
   * Executes a SPARQL query against the Artsdata endpoint.
   * @param sparqlQuery
   * @param infer
   */
  async executeSparqlQuery(sparqlQuery: string , infer = false): Promise<any> {
    const sparqlEndpoint = this._getArtsdataEndPoint();
    console.log(`Executing Sparql query:\n${sparqlQuery}`);
    const queryParam = `query=${encodeURIComponent(sparqlQuery)}&infer=${infer}`;

    try {
      return await this.httpService.postRequest(sparqlEndpoint , queryParam);
    } catch (error) {
      console.error("Error executing SPARQL query:" , error);
      throw Exception.internalServerError(`Error executing SPARQL query: ${error.message}`);
    }
  }
}