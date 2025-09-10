import { Injectable } from "@nestjs/common";
import { ARTSDATA } from "../../config";
import { HttpService } from "../http";
import { Exception , MatchServiceHelper } from "../../helper";
import { LanguageEnum } from "../../enum";
import { QUERIES } from "../../constant";
import { ResultCandidates } from "../../dto";

@Injectable()
export class ArtsdataService {

  constructor(private readonly httpService: HttpService) {
  }

  /**
   * @name _getArtsdataEndPoint
   * @description Get the Artsdata endpoint
   * @returns {string}
   */
  private _getArtsdataEndPoint(): string {
    const route = "repositories/" + ARTSDATA.REPOSITORY;
    const sparqlEndpoint = new URL(route , ARTSDATA.ENDPOINT);
    return sparqlEndpoint.toString();
  }

  /**
   * @name executeSparqlQuery
   * @description Get raw result for sparql query from Artsdata
   * @param sparqlQuery
   * @param infer
   */
  async executeSparqlQuery(sparqlQuery: string , infer?: boolean): Promise<any> {
    const sparqlEndpoint: string = this._getArtsdataEndPoint();
    console.log(`Executing Sparql query:\n ${sparqlQuery}`);
    const queryParam = `query=${encodeURIComponent(sparqlQuery)}&infer=${infer ? "true" : "false"}`;

    try {
      return await this.httpService.postRequest(sparqlEndpoint , queryParam);
    } catch (error) {
      console.error("Error executing SPARQL query:" , error);
      throw Exception.internalServerError("Error executing SPARQL query" + error.message);
    }
  }

}
