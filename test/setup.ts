import {execFileSync} from "node:child_process";
import * as path from "node:path";
import * as dotenv from "dotenv";
import {
    COMPOSE_FILE,
    createRepository,
    deleteStaleRunRepositories,
    isGraphDBUp,
    isLocal,
    log,
    newRunRepositoryId,
    ROOT,
    withTrailingSlash
} from "./util/graphdb-admin.util";

/**
 * Jest global setup.
 *
 * 1. Reuses GraphDB if it already answers at ARTSDATA_ENDPOINT (e.g. CI started it); otherwise, for a local
 *    endpoint, starts it with test/graph-db/docker-compose.yml (same as CI) and waits for it.
 * 2. Creates a fresh repository for this run, named recon-test-<yyyyMMddHHmmss> (e.g. recon-test-20261008112130),
 *    from test/graph-db/data/config.ttl and exports it as REPOSITORY, so every suite uses it.
 *    test/teardown.ts deletes it once all suites have finished.
 *
 * The GraphDB container is left running so later runs start instantly; stop it with
 * `docker compose -f test/graph-db/docker-compose.yml down`.
 */

const STARTUP_TIMEOUT_MS = 180_000;
const STALE_REPOSITORY_AGE_MS = 6 * 3600 * 1000;

export default async function globalSetup(): Promise<void> {
    dotenv.config({path: path.join(ROOT, ".env.test")});
    const endpoint = withTrailingSlash(process.env.ARTSDATA_ENDPOINT || "http://localhost:7200/");

    if (await isGraphDBUp(endpoint)) {
        log(`Using GraphDB already running at ${endpoint}`);
    } else {
        if (!isLocal(endpoint)) {
            throw new Error(`GraphDB at ${endpoint} is not reachable, and it is not a local endpoint I can start.`);
        }
        log(`GraphDB not running at ${endpoint}; starting it with Docker...`);
        startWithDocker();
        await waitForGraphDB(endpoint);
        log("GraphDB is up.");
    }

    await deleteStaleRunRepositories(endpoint, STALE_REPOSITORY_AGE_MS);

    const repositoryId = newRunRepositoryId();
    await createRepository(endpoint, repositoryId);
    log(`Created repository "${repositoryId}" for this run.`);

    // Inherited by the test workers; dotenv does not override variables that are already set,
    // so src/config/system.config.ts picks these up instead of the values in .env.test.
    process.env.ARTSDATA_ENDPOINT = endpoint;
    process.env.REPOSITORY = repositoryId;
    process.env.TEST_RUN_REPOSITORY = repositoryId;
}

function startWithDocker(): void {
    const attempts: [string, string[]][] = [
        ["docker", ["compose", "-f", COMPOSE_FILE, "up", "-d"]],
        ["docker-compose", ["-f", COMPOSE_FILE, "up", "-d"]],
    ];
    const errors: string[] = [];
    for (const [command, args] of attempts) {
        try {
            execFileSync(command, args, {cwd: ROOT, stdio: "inherit"});
            return;
        } catch (error) {
            errors.push(`${command} ${args.join(" ")}: ${(error as Error).message}`);
        }
    }
    throw new Error(`Could not start GraphDB with Docker. Is Docker running?\n${errors.join("\n")}`);
}

async function waitForGraphDB(endpoint: string): Promise<void> {
    const deadline = Date.now() + STARTUP_TIMEOUT_MS;
    while (Date.now() < deadline) {
        if (await isGraphDBUp(endpoint)) return;
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    throw new Error(`GraphDB did not become ready at ${endpoint} within ${STARTUP_TIMEOUT_MS / 1000}s`);
}
