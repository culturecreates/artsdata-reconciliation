import {http, query} from "graphdb";
import {ARTSDATA} from "../../src/config";

import RDFRepositoryClient from 'graphdb/lib/repository/rdf-repository-client';
import RepositoryClientConfig from 'graphdb/lib/repository/repository-client-config';


export async function executeSparql(updateQuery: string) {
    const config = new RepositoryClientConfig(ARTSDATA.ENDPOINT)
        .setEndpoints([`${ARTSDATA.ENDPOINT}repositories/${ARTSDATA.REPOSITORY}`])
        .setHeaders({})
        .setDefaultRDFMimeType('');

    if (ARTSDATA.USER) {
        config.useGdbTokenAuthentication(ARTSDATA.USER, ARTSDATA.USER);
    }

    const repository = new RDFRepositoryClient(config);

    const payload = new query.UpdateQueryPayload()
        .setQuery(updateQuery)
        .setContentType(http.QueryContentType.X_WWW_FORM_URLENCODED)
        .setInference(true)
        .setInference(true)
        .setTimeout(5);
    try {
        return repository.update(payload);
    } catch (e) {
        console.error('Error executing SPARQL query:', e);
        throw e;
    }
}