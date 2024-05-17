import { Test, TestingModule } from "@nestjs/testing";
import { ReconciliationService, ManifestService, ArtsdataService, HttpService} from "../../service";
import { ManifestController, ReconciliationController } from "../../controller";

describe('Recon Service tests', () => {
    let reconService: ReconciliationService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
          controllers: [ManifestController, ReconciliationController],
          providers: [ManifestService, ReconciliationService, ArtsdataService, HttpService]
        }).compile();
    
        reconService = app.get<ReconciliationService>(ReconciliationService);
    });

    describe("Recon API Tests", () => {
        jest.setTimeout(200000)
        const testCases = [
            {
                description: "It should search for uris that match 100%",
                query: {
                    q0: {
                        query: "Théâtre Maisonneuve",
                        type: "schema:Place",
                        limit: 1
                    }
                },
                expectedName: "Place des Arts - Théâtre Maisonneuve",
                expectedCount: 1
            },
            {
                description: "It should search for uris by matching name in substring",
                query:{
                    q0: {
                        query: "The locations is in the lovely Bluma Appel Theatre and Berkeley Street Theatre.",
                        type: "schema:Place",
                        limit: 1
                    }
                },
                expectedName: "St. Lawrence Centre for the Arts - Bluma Appel Theatre",
                expectedCount: 1
                
            },
            {
                description: "It should search for VaughnCo Entertainment presents",
                query:{
                    q0: {
                        query: "VaughnCo Entertainment presents",
                        type: "schema:Organization",
                        limit: 1
                    }
                },
                expectedName: "VaughnCo Entertainment",
                expectedCount: 1
            },
            {
                description: "It should search for Wajdi Mouawad",
                query:{
                    q0: {
                        query: "Wajdi Mouawad",
                        type: "schema:Person",
                        limit: 1
                    }
                },
                expectedName: "Wajdi Mouawad",
                expectedCount: 1
            },
            {
                description: "It should search for nowhere",
                query:{
                    q0: {
                        query: "Show is nowhere",
                        type: "schema:Place",
                        limit: 1
                    }
                },
                expectedName: undefined,
                expectedCount: 0
            },
            {
                description: "It should remove duplicates",
                query:{
                    q0: {
                        query: "The locations is in the lovely Berkeley Street Theatre and Canadian Stage - Berkeley Street Theatre.",
                        type: "schema:Place",
                        limit: 2
                    }
                },
                expectedName: "Canadian Stage - Berkeley Street Theatre",
                expectedCount: 2,
                duplicateCheck: true
            },
            {
                description: "It should match names with single neutral quote",
                query:{
                    q0: {
                        query: "Shippagan 20 h 00 La P'tite Église (Shippagan)",
                        type: "schema:Place",
                        limit: 1
                    }
                },
                expectedName: "La P'tite Église (Shippagan)",
                expectedCount: 1
            },
            {
                description: "It should match names with single curved quote",
                query:{
                    q0: {
                        query: "Emily D’Angelo",
                        type: "schema:Person",
                        limit: 1
                    }
                },
                expectedName: "Emily D’Angelo",
                expectedCount: 1
            },
            {
                description: "It should match names with &",
                query:{
                    q0: {
                        query: "meagan&amp;amy",
                        type: "schema:Organization",
                        limit: 1
                    }
                },
                expectedName: "meagan&amy",
                expectedCount: 1
            },
            {
                description: "It should match places with title in French",
                query:{
                    q0: {
                        query: "Théâtre Marc Lescarbot",
                        type: "schema:Place",
                        limit: 1
                    }
                },
                expectedName: "le Marc Lescarbot (Pointe-de-l’église)",
                expectedCount: 1
            },
            {
                description: "It should find alternate names",
                query:{
                    q0: {
                        query: "Shell Theatre",
                        type: "schema:Place",
                        limit: 1
                    }
                },
                expectedName: "Dow Centennial Centre - Shell Theatre",
                expectedCount: 1
            },
            {
                description: "It should find additional type using artsdata",
                query:{
                    q0: {
                        query: "Dance",
                        type: "ado:EventType",
                        limit: 1
                    }
                },
                expectedName: "Dance",
                expectedCount: 1
            }
        ]

        for(const test of testCases){
            it(test.description, async () => {
                const result = await reconService.reconcileByQueries(test.query);
                expect(result.q0?.result[0]?.name).toBe(test.expectedName);
                expect(result.q0?.result?.length).toBe(test.expectedCount);
                if(test.duplicateCheck){
                    expect(result.q0.result[0].name === result.q0.result[1].name).toBeFalsy();
                }
            })
        }

    })

    
});
