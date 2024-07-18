import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class HttpService {
  async postRequest(url: string, query: string): Promise<any> {
    try {
      const response = await axios.post(
        url,
        query,
        {
          headers: {
            "Accept": "application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8",
            "Origin": "https://db.artsdata.ca",
            "Referer": "https://db.artsdata.ca/"
          }
        }
      );
      return response?.data;
    } catch (e) {
      console.log(e);
    }
  }


}
