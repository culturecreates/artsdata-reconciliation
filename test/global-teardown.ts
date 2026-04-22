export default async function globalTeardown(): Promise<void> {
    console.log("Shutting down GraphDB Docker container...");

    const container = (global as any).__GRAPHDB_CONTAINER__;

    if (container) {
        await container.stop();
        console.log("Container stopped successfully.");
    } else {
        console.warn("No GraphDB container found to stop.");
    }
}