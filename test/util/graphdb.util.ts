import {http, query} from "graphdb";
import {ARTSDATA} from "../../src/config";

import RDFRepositoryClient from 'graphdb/lib/repository/rdf-repository-client';
import RepositoryClientConfig from 'graphdb/lib/repository/repository-client-config';


export async function executeSparql(updateQuery: string) {
    const config = new RepositoryClientConfig(ARTSDATA.ENDPOINT)
        .setEndpoints([`${ARTSDATA.ENDPOINT}repositories/${ARTSDATA.REPOSITORY}`])
        .setHeaders({})
        .setDefaultRDFMimeType('')
        .setReadTimeout(1000)
        .setWriteTimeout(1000);

    if (ARTSDATA.USER) {
        config.useGdbTokenAuthentication(ARTSDATA.USER, ARTSDATA.USER);
    }

    const repository = new RDFRepositoryClient(config);

    const payload = new query.UpdateQueryPayload()
        .setQuery(updateQuery)
        .setContentType(http.QueryContentType.X_WWW_FORM_URLENCODED)
        .setInference(true)
        .setTimeout(5);

    return repository.update(payload);
}