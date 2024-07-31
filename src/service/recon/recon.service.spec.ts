import { Test, TestingModule } from "@nestjs/testing";
import { ArtsdataService, HttpService, ManifestService, ReconciliationService } from "../../service";
import { ManifestController, ReconciliationController } from "../../controller";
import { LanguageTagEnum } from "../../enum";

describe("Recon Service tests", () => {
  let reconService: ReconciliationService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ManifestController, ReconciliationController],
      providers: [ManifestService, ReconciliationService, ArtsdataService, HttpService]
    }).compile();

    reconService = app.get<ReconciliationService>(ReconciliationService);
  });

  describe("Recon API Tests", () => {
    jest.setTimeout(200000);
    const testCases = [
      {
        description: "It should search for uris that match 100%",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "Théâtre Maisonneuve"
              }
            ]
          }
        ],
        expectedName: "Place des Arts - Théâtre Maisonneuve",
        expectedCount: 1
      },
      {
        description: "It should search for uris by matching name in substring",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "The locations is in the lovely Bluma Appel Theatre and Berkeley Street Theatre."
              }
            ]
          }
        ],
        expectedName: "St. Lawrence Centre for the Arts - Bluma Appel Theatre",
        expectedCount: 1

      },
      {
        description: "It should search for VaughnCo Entertainment presents",
        queries: [
          {
            type: "schema:Organization",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "VaughnCo Entertainment presents"
              }
            ]
          }
        ],
        expectedName: "VaughnCo Entertainment",
        expectedCount: 1
      },
      {
        description: "It should search for Wajdi Mouawad",
        queries: [
          {
            type: "schema:Person",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "Wajdi Mouawad"
              }
            ]
          }
        ],
        expectedName: "Wajdi Mouawad",
        expectedCount: 1
      },
      {
        description: "It should search for nowhere",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "Show is nowhere"
              }
            ]
          }
        ],
        expectedName: undefined,
        expectedCount: 0
      },
      {
        description: "It should remove duplicates",
        queries: [
          {
            type: "schema:Place",
            limit: 2,
            conditions: [
              {
                matchType: "name",
                v: "The locations is in the lovely Berkeley Street Theatre and Canadian Stage - Berkeley Street Theatre."
              }
            ]
          }
        ],
        expectedName: "Canadian Stage - Berkeley Street Theatre",
        expectedCount: 2,
        duplicateCheck: true
      },
      {
        description: "It should match names with single neutral quote",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "Shippagan 20 h 00 La P'tite Église (Shippagan)"
              }
            ]
          }
        ],
        expectedName: "La P'tite Église (Shippagan)",
        expectedCount: 1
      },
      {
        description: "It should match names with single curved quote",
        queries: [
          {
            type: "schema:Person",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "Emily D’Angelo"
              }
            ]
          }
        ],
        expectedName: "Emily D’Angelo",
        expectedCount: 1
      },
      {
        description: "It should match names with &",
        queries: [
          {
            type: "schema:Organization",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "meagan&amp;amy"
              }
            ]
          }
        ],
        expectedName: "meagan&amy",
        expectedCount: 1
      },
      {
        description: "It should match places with title in French",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "Théâtre Marc Lescarbot"
              }
            ]
          }
        ],
        expectedName: "le Marc Lescarbot (Pointe-de-l’église)",
        expectedCount: 1
      },
      {
        description: "It should find alternate names",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "Shell Theatre"
              }
            ]
          }
        ],
        expectedName: "Dow Centennial Centre - Shell Theatre",
        expectedCount: 1
      },
      {
        description: "It should find additional type using artsdata",
        queries: [
          {
            type: "ado:EventType",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                v: "Dance"
              }
            ]
          }
        ],
        expectedName: "Dance",
        expectedCount: 1
      }
    ];

    for (const test of testCases) {
      it(test.description, async () => {
        const result = await reconService
          .reconcileByQueries({ queries: test.queries });
        let title = result.results?.[0]?.candidates?.[0]?.name;
        title = title instanceof String ? title : (title as any)?.values.find((value: {
          lang: string;
          str: string
        }) => value.lang === LanguageTagEnum.ENGLISH || value.lang === LanguageTagEnum.FRENCH || value.lang === undefined).str;
        //TODO the ado:EventType query is not returning schema:name instead it is returning skos:prefLabel
        if (title)
          expect(title).toBe(test.expectedName);
        expect(result.results?.[0].candidates.length).toBe(test.expectedCount);
        if (test.duplicateCheck) {
          expect(result.results[0]?.candidates?.[0].name === result.results[0]?.candidates?.[1].name).toBeFalsy();

        }
      });
    }

  });


});
