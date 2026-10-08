import {deleteRepository, log, withTrailingSlash} from "./util/graphdb-admin.util";

/** Jest global teardown: deletes the repository created for this run by test/setup.ts. */
export default async function globalTeardown(): Promise<void> {
    const repositoryId = process.env.TEST_RUN_REPOSITORY;
    if (!repositoryId) return;

    const endpoint = withTrailingSlash(process.env.ARTSDATA_ENDPOINT as string);
    try {
        await deleteRepository(endpoint, repositoryId);
        log(`Deleted repository "${repositoryId}".`);
    } catch (error) {
        // Don't fail the test run over cleanup; the next run removes leftovers older than 6 hours.
        log(`Could not delete repository "${repositoryId}": ${(error as Error).message}`);
    }
}
