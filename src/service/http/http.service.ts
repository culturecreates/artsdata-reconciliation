import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class HttpService {
  async postRequest(url: string, query: string): Promise<any> {
    const response = await axios.post(
      url,
      query,
      // "query=PREFIX+luc%3A+%3Chttp%3A%2F%2Fwww.ontotext.com%2Fowlim%2Flucene%23%3E%0A++++++++PREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0A++++++++PREFIX+schema%3A+%3Chttp%3A%2F%2Fschema.org%2F%3E%0A++++++++SELECT+%0A++++++++++++++%3ForiginalUri%0A++++++++++++++%3Fscore+(sample(%3Fnames)+as+%3Fname)%0A++++++++++++++(sample(%3FdisambiguatingDescriptions)+as+%3FdisambiguatingDescription)+%0A++++++++WHERE+%7B%0A++++++++++++++values+%3Fquery+%7B+%22Taurey+Butler%22+%7D%0A++++++++++++++values+%3Ftype+%7B+schema%3APerson+%7D%0A++++%0A++++++++%3ForiginalUri+a+%3Ftype+%3B+%0A+++++++++++++++++++++luc%3AName+%3Fquery%3B%0A+++++++++++++++++++++rdfs%3Alabel+%3Fnames+%3B%0A+++++++++++++++++++++luc%3Ascore+%3Fscore+.%0A++++++++%0A++++++++OPTIONAL+%7B%0A++++++++++++++++++%3ForiginalUri++schema%3AdisambiguatingDescription+%3FdisambiguatingDescriptions+.%0A++++++++%7D%0A++++%0A++++++++FILTER+(STRSTARTS(STR(%3ForiginalUri)%2C%22http%3A%2F%2Fkg.artsdata.ca%2Fresource%2FK%22+))%0A++++++++%7D+GROUP+BY+%3ForiginalUri+%3Fscore&infer=true&sameAs=true&limit=1001&offset=0",
      {
        headers: {
          "Accept": "application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8",
          "Origin": "https://db.artsdata.ca",
          "Referer": "https://db.artsdata.ca/"
        }
      }
    );
    return response?.data
  }



}
