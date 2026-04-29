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
