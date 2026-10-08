import {readFile} from "node:fs/promises";
import * as path from "node:path";

/** Helpers used by the jest global setup / teardown to manage the GraphDB test repository. */

export const ROOT = path.resolve(__dirname, "../..");
export const COMPOSE_FILE = path.join(ROOT, "test/graph-db/docker-compose.yml");
const REPO_CONFIG = path.join(ROOT, "test/graph-db/data/config.ttl");

/** Per-run repositories are named recon-test-<yyyyMMddHHmmss> in local time, e.g. recon-test-20261008112130. */
const RUN_REPOSITORY_PATTERN = /^recon-test-(\d{14})$/;

export function withTrailingSlash(url: string): string {
    return url.endsWith("/") ? url : `${url}/`;
}

export function isLocal(endpoint: string): boolean {
    return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(endpoint).hostname);
}

export function log(message: string): void {
    // eslint-disable-next-line no-console
    console.log(`[graphdb-test] ${message}`);
}

/** recon-test-<yyyyMMddHHmmss> in local time, e.g. recon-test-20261008112130. */
export function newRunRepositoryId(now = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `recon-test-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
        + `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function parseRunTimestamp(repositoryId: string): Date | undefined {
    const match = repositoryId.match(RUN_REPOSITORY_PATTERN);
    if (!match) return undefined;
    const t = match[1];
    return new Date(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8),
        +t.slice(8, 10), +t.slice(10, 12), +t.slice(12, 14));
}

export async function isGraphDBUp(endpoint: string): Promise<boolean> {
    try {
        const response = await fetch(`${endpoint}rest/repositories`, {signal: AbortSignal.timeout(3000)});
        return response.ok;
    } catch {
        return false;
    }
}

export async function listRepositories(endpoint: string): Promise<string[]> {
    const response = await fetch(`${endpoint}rest/repositories`, {headers: {Accept: "application/json"}});
    if (!response.ok) throw new Error(`Listing repositories failed: ${response.status} ${await response.text()}`);
    return ((await response.json()) as { id: string }[]).map(({id}) => id);
}

/** Creates a repository from test/graph-db/data/config.ttl, with its repositoryID replaced by `repositoryId`. */
export async function createRepository(endpoint: string, repositoryId: string): Promise<void> {
    const template = await readFile(REPO_CONFIG, "utf8");
    const config = template.replace(/(rep:repositoryID\s+)"[^"]*"/, `$1"${repositoryId}"`);
    if (!config.includes(`"${repositoryId}"`)) {
        throw new Error(`Could not set rep:repositoryID in ${REPO_CONFIG}`);
    }

    const form = new FormData();
    form.append("config", new Blob([config], {type: "text/turtle"}), "config.ttl");
    const response = await fetch(`${endpoint}rest/repositories`, {method: "POST", body: form});
    if (!response.ok) {
        throw new Error(`Creating repository "${repositoryId}" failed: ${response.status} ${await response.text()}`);
    }
}

export async function deleteRepository(endpoint: string, repositoryId: string): Promise<void> {
    const response = await fetch(`${endpoint}rest/repositories/${encodeURIComponent(repositoryId)}`,
        {method: "DELETE"});
    if (!response.ok && response.status !== 404) {
        throw new Error(`Deleting repository "${repositoryId}" failed: ${response.status} ${await response.text()}`);
    }
}

/**
 * Deletes per-run repositories left behind by runs that were killed before teardown (Ctrl-C, crash).
 * Only repositories older than `maxAgeMs` are removed, so parallel runs against the same GraphDB are safe.
 */
export async function deleteStaleRunRepositories(endpoint: string, maxAgeMs: number): Promise<void> {
    const now = Date.now();
    for (const id of await listRepositories(endpoint)) {
        const createdAt = parseRunTimestamp(id);
        if (createdAt && now - createdAt.getTime() > maxAgeMs) {
            log(`Removing stale repository "${id}"`);
            await deleteRepository(endpoint, id).catch((error) => log(`  could not remove it: ${error.message}`));
        }
    }
}
