import {Injectable} from "@nestjs/common";
import {ARTSDATA, FEATURE_FLAG} from "../../config";
import {HttpService} from "../http";
import {Exception} from "../../helper";
import axios from "axios";

@Injectable()
export class ArtsdataService {

    constructor(private readonly httpService: HttpService) {}

    private token: string;
    
    /**
     * Constructs the Artsdata SPARQL query endpoint URL.
     * @private
     */
    private _getArtsdataEndPoint(): string {
        const route = `repositories/${ARTSDATA.REPOSITORY}`;
        return new URL(route, ARTSDATA.ENDPOINT).toString();
    }

    /**
     * Constructs the Artsdata SPARQL update endpoint URL.
     * @private
     */
    private _getArtsdataUpdateEndPoint(): string {
        const route = `repositories/${ARTSDATA.REPOSITORY}/statements`;
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
            if (error?.response?.status === 401) {
                console.warn("GraphDB returned 401 — token may be expired. Attempting token refresh...");
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    console.log("Token refreshed successfully. Retrying original request...");
                    try {
                        return await this.httpService.postRequest(sparqlEndpoint, queryParam, this.token);
                    } catch (retryError) {
                        console.error("Request failed after token refresh:", retryError.message);
                        throw Exception.internalServerError(`SPARQL query failed after token refresh: ${retryError.message}`);
                    }
                }
                console.error("Token refresh failed. Cannot retry request.");
                throw Exception.internalServerError("GraphDB authentication failed after token refresh attempt.");
            }
            console.error("Error executing SPARQL query:", error.message);
            throw Exception.internalServerError(`Error executing SPARQL query: ${error.message}`);
        }

    }

    /**
     * Executes a SPARQL update (INSERT DATA / DELETE DATA / DROP GRAPH, etc.)
     * against the Artsdata statements endpoint.
     * @param sparqlUpdate
     */
    async executeSparqlUpdate(sparqlUpdate: string): Promise<void> {
        const updateEndpoint = this._getArtsdataUpdateEndPoint();
        const headers: Record<string, string> = {
            "Content-Type": "application/x-www-form-urlencoded",
        };
        if (this.token) {
            headers["Authorization"] = this.token;
        }
        try {
            await axios.post(
                updateEndpoint,
                `update=${encodeURIComponent(sparqlUpdate)}`,
                {headers},
            );
        } catch (error) {
            console.error("Error executing SPARQL update:", error.message);
            throw Exception.internalServerError(`Error executing SPARQL update: ${error.message}`);
        }
    }

    /**
     * Refreshes the GraphDB token by re-running the login flow.
     */
    public async refreshToken(): Promise<boolean> {
        console.log("Refreshing GraphDB token...");
        return this.checkConnection();
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

    public async checkConnection(): Promise<boolean> {
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