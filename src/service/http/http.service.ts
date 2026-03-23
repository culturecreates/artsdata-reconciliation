import {forwardRef, Inject, Injectable} from "@nestjs/common";
import axios from "axios";
import {Exception} from "../../helper";
import {ArtsdataService} from "../artsdata";

@Injectable()
export class HttpService {

    constructor(
        @Inject(forwardRef(() => ArtsdataService))
        private readonly artsdataService: ArtsdataService
    ) {}

    async postRequest(url: string, query: string, token: string, retry = true): Promise<any> {
        try {
            const response = await axios.post(
                url,
                query,
                {
                    headers: {
                        "Accept": "application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8",
                        "Origin": "https://db.artsdata.ca",
                        "Referer": "https://db.artsdata.ca/",
                        Authorization: token

                    }
                }
            );
            if (response.status === 200) {
                return response?.data;
            }


        } catch (e) {
            if (e?.response?.status === 401 && retry) {
                console.warn("GraphDB returned 401 — token may be expired. Attempting token refresh...");
                const refreshed = await this.artsdataService.refreshToken();
                if (refreshed) {
                    console.log("Token refreshed successfully. Retrying original request...");
                    return this.postRequest(url, query, this.artsdataService.getToken(), false);
                }
                console.error("Token refresh failed. Giving up on request.");
                return Exception.internalServerError("GraphDB authentication failed after token refresh attempt.");
            }
            console.error("HTTP request failed:", e.message);
            return Exception.internalServerError(e.message);
        }
    }

}
