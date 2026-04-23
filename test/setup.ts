import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { GenericContainer, StartedTestContainer } from "testcontainers";

export default async function globalSetup(): Promise<void> {
    console.log("Starting GraphDB for the test suites...");
    const container: StartedTestContainer = await new GenericContainer("ontotext/graphdb:10.8.11")
        .withExposedPorts(7200)
        .withEnvironment({"GDB_ACCEPT_EULA": "yes"})
        .start();

    const host = container.getHost();
    const port = container.getMappedPort(7200);
    const url = `http://${host}:${port}`;

    (global as any).__GRAPHDB_CONTAINER__ = container;
    process.env.GRAPHDB_URL = url;

    await waitForGraphDB(url);
    await initializeRepository(url);

    console.log("GraphDB is ready and indexed!");
}

async function waitForGraphDB(url: string): Promise<void> {
    let ready = false;
    while (!ready) {
        try {
            await axios.get(`${url}/protocol`);
            ready = true;
        } catch (e) {
            await new Promise(res => setTimeout(res, 2000));
        }
    }
}

async function initializeRepository(baseUrl: string): Promise<void> {
    const repoId = 'recon-test';

    const configPath = path.resolve(process.cwd(), 'test/graph-db/data/config.ttl');
    if (!fs.existsSync(configPath)) {
        throw new Error(`Repository config not found at: ${configPath}`);
    }

    const configForm = new FormData();
    configForm.append('config', fs.createReadStream(configPath), { filename: 'config.ttl' });

    await axios.post(`${baseUrl}/rest/repositories`, configForm, {
        headers: configForm.getHeaders()
    });
    console.log(`  - Repository initialized using ${path.basename(configPath)}`);

    const dataPath = path.resolve(process.cwd(), 'test/graph-db/data/test-dataset.jsonld');
    if (fs.existsSync(dataPath)) {
        const fileStream = fs.createReadStream(dataPath);
        const graphName = 'http://kg.artsdata.ca/core';
        await axios.post(
            `${baseUrl}/repositories/${repoId}/statements?context=${encodeURIComponent('<' + graphName + '>')}`,
            fileStream,
            {
                headers: {
                    'Content-Type': 'application/ld+json'
                }
            }
        );
        console.log(`Data loaded from ${path.basename(dataPath)}.`);
    }else{
        throw new Error(`Data file not found at: ${dataPath}`);
    }

    const sparqlDir = path.resolve(process.cwd(), 'seed/sparql/index');
    if (fs.existsSync(sparqlDir)) {
        const sparqlFiles = fs.readdirSync(sparqlDir)
            .filter((f: string) => f.endsWith('.sparql'));

        for (const file of sparqlFiles) {
            const query = fs.readFileSync(path.join(sparqlDir, file), 'utf8');

            await axios.post(`${baseUrl}/repositories/${repoId}/statements`, query, {
                headers: { 'Content-Type': 'application/sparql-update' }
            });
            console.log(`Indexing: ${file} executed.`);
        }
    }
}