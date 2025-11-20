import {Injectable} from "@nestjs/common";
import {ARTSDATA, FEATURE_FLAG} from "../../config";
import {HttpService} from "../http";
import {Exception} from "../../helper";
import axios from "axios";

@Injectable()
export class ArtsdataService {
    constructor(private readonly httpService: HttpService) {
    }

    private token: string;

    /**
     * Constructs the Artsdata SPARQL endpoint URL.
     * @private
     */
    private _getArtsdataEndPoint(): string {
        const route = `repositories/${ARTSDATA.REPOSITORY}`;
        return new URL(route, ARTSDATA.ENDPOINT).toString();
    }

    /**
     * Executes a SPARQL query against the Artsdata endpoint.
     * @param sparqlQuery
     * @param infer
     */
    async executeSparqlQuery(sparqlQuery: string, infer = false): Promise<any> {
        const sparqlEndpoint = this._getArtsdataEndPoint();

        if (FEATURE_FLAG.LOG_QUERIES) {
            console.log(`Executing Sparql query:\n${sparqlQuery}`);
        }

        const queryParam = `query=${encodeURIComponent(sparqlQuery)}&infer=${infer}`;

        try {
            return await this.httpService.postRequest(sparqlEndpoint, queryParam, this.token);
        } catch (error) {
            console.error("Error executing SPARQL query:", error.message);
            throw Exception.internalServerError(`Error executing SPARQL query: ${error.message}`);
        }
    }

    /**
     * Try up to `retries` times with delay between each attempt
     */
    public async checkConnectionWithRetry(retries = 3, delayMs = 3000): Promise<boolean> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            const success = await this.checkConnection();
            if (success) return true;

            console.warn(` GraphDB connection failed (attempt ${attempt}/${retries}).`);
            if (attempt < retries) {
                console.log(` Retrying in ${delayMs / 1000}s...`);
                await new Promise((res) => setTimeout(res, delayMs));
            }
        }
        return false;
    }

    private async checkConnection(): Promise<boolean> {
        try {
            if (ARTSDATA.USER && ARTSDATA.PASSWORD) {
                const loginUrl = `${ARTSDATA.ENDPOINT}rest/login/${ARTSDATA.USER}`;

                const response = await axios.post(loginUrl, null, {
                    headers: {'X-GraphDB-Password': ARTSDATA.PASSWORD}
                });
                const token = response.headers?.authorization
                if (token) {
                    this.token = token;
                    console.log('Graph DB authentication success');
                } else {
                    console.warn('Graph DB authentication Failed');
                    return false;
                }
            }

            const repoUrl = `${ARTSDATA.ENDPOINT}repositories`;
            const headers: Record<string, string> = {};
            if (this.token) {
                headers['Authorization'] = `${this.token}`;
            }

            const testResp = await axios.get(repoUrl, {headers});
            if (testResp.status === 200) {
                console.log(`GraphDB connection verified successfully. ${ARTSDATA.ENDPOINT} `);
                return true;
            }
            console.warn(`GraphDB responded with ${testResp.status}`);
            return false;
        } catch (err) {
            console.error(`GraphDB connection failed: ${err.message}`);
            return false;
        }
    }
}