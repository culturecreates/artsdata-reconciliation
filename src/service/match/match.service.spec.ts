import { Test, TestingModule } from "@nestjs/testing";
import {
  ArtsdataService,
  HttpService,
  ManifestService,
  MatchService,
} from "../../service";
import { ManifestController, MatchController } from "../../controller";
import { LanguageEnum } from "../../enum";

describe("Recon Service tests", () => {
  let reconService: MatchService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ManifestController, MatchController],
      providers: [ManifestService, MatchService, ArtsdataService, HttpService],
    }).compile();

    reconService = app.get<MatchService>(MatchService);
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
                propertyValue: "Théâtre Maisonneuve",
              },
            ],
          },
        ],
        expectedId: "K11-11",
        expectedName: "Place des Arts - Théâtre Maisonneuve",
        expectedCount: 1,
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
                propertyValue:
                  "The locations is in the lovely Bluma Appel Theatre and Berkeley Street Theatre.",
              },
            ],
          },
        ],
        expectedName: "Bluma Appel Theatre",
        expectedCount: 1,
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
                propertyValue: "VaughnCo Entertainment presents",
              },
            ],
          },
        ],
        expectedName: "VaughnCo Entertainment",
        expectedCount: 1,
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
                propertyValue: "Wajdi Mouawad",
              },
            ],
          },
        ],
        expectedName: "Wajdi Mouawad",
        expectedCount: 1,
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
                propertyValue: "nowhere",
              },
            ],
          },
        ],
        expectedName: undefined,
        expectedCount: 0,
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
                propertyValue:
                  "The locations is in the lovely Berkeley Street Theatre and Canadian Stage - Berkeley Street Theatre.",
              },
            ],
          },
        ],
        expectedName: "Canadian Stage - Berkeley Street Theatre",
        expectedCount: 2,
        duplicateCheck: true,
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
                propertyValue: "Shippagan 20 h 00 La P'tite Église (Shippagan)",
              },
            ],
          },
        ],
        expectedName: "La P'tite Église (Shippagan)",
        expectedCount: 1,
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
                propertyValue: "Emily D’Angelo",
              },
            ],
          },
        ],
        expectedName: "Emily D’Angelo",
        expectedCount: 1,
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
                propertyValue: "meagan&amp;amy",
              },
            ],
          },
        ],
        expectedName: "meagan&amy",
        expectedCount: 1,
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
                propertyValue: "Théâtre Marc Lescarbot",
              },
            ],
          },
        ],
        expectedName: "Salle Marc Lescarbot",
        expectedCount: 1,
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
                propertyValue: "Shell Theatre",
              },
            ],
          },
        ],
        expectedName: "Dow Centennial Centre - Shell Theatre",
        expectedCount: 1,
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
                propertyValue: "Dance",
              },
            ],
          },
        ],
        expectedName: "Social Dance",
        expectedCount: 1,
      },
      {
        description: "Reconcile a Place with Artsdata ID",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "http://kg.artsdata.ca/resource/K11-19",
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedName: "Roy Thomson Hall",
        expectedCount: 1,
      },
      {
        description: "Reconcile Place with Artsdata URI",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "http://kg.artsdata.ca/resource/K11-19",
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedName: "Roy Thomson Hall",
        expectedCount: 1,
      },
      {
        description: "Reconcile Place with Name",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Roy Thomson Hall",
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedName: "Roy Thomson Hall",
        expectedCount: 1,
      },
      {
        description: "Reconcile Place with Name",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Roy Thomson Hall",
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedName: "Roy Thomson Hall",
        expectedCount: 1,
      },
      {
        description: "Reconcile Place with Name and Postal code",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Roy Thomson",
              },
              {
                matchType: "property",
                propertyValue: "M5J 2H5",
                propertyId: "schema:address/schema:postalCode",
                required: true,
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedName: "Roy Thomson Hall",
        expectedCount: 1,
      },
      {
        description: "Reconcile Place with Name and Street Address",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Roy Thomson",
              },
              {
                matchType: "property",
                propertyValue: "60 Simcoe Street",
                propertyId: "schema:address/schema:streetAddress",
                required: true,
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedName: "Roy Thomson Hall",
        expectedCount: 1,
      },
      {
        description: "Reconcile Event with Name",
        queries: [
          {
            type: "schema:Event",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Matilda - Citadel Theatre",
              },
            ],
          },
        ],
        expectedId: "K43-1701",
        expectedName: "Dufflebag Theatre",
        expectedCount: 1,
      },
      {
        description: "Reconcile Event with Name and startDate",
        queries: [
          {
            type: "schema:Event",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Matilda - Citadel Theatre",
                propertyId: "string",
                required: true,
              },
              {
                matchType: "property",
                propertyValue: "2025-12-28T13:00:00-04:00",
                propertyId: "schema:startDate",
                required: true,
              },
            ],
          },
        ],
        expectedId: "K43-1701",
        expectedName: "Dufflebag Theatre",
        expectedCount: 1,
      },
      //TODO this should eventually pass when all the URLs are converted to URLS in graphdb
      // {
      //   description: "Reconcile Place with only URL" ,
      //   queries: [
      //     {
      //       "type": "schema:Place" ,
      //       "conditions": [
      //         {
      //           "matchType": "property" ,
      //           "propertyValue": "https://www.roythomsonhall.com" ,
      //           "propertyId": "schema:url" ,
      //           "required": true
      //         }
      //       ]
      //     }
      //   ] , expectedId: "K11-19" ,
      //   expectedName: "Roy Thomson Hall" ,
      //   expectedCount: 1
      // } ,
      {
        description:
          "Reconcile Place with matching name and postal code and match should be true",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Roy Thomson Hall",
              },
              {
                matchType: "property",
                propertyValue: "M5J 2H5",
                propertyId:
                  "<http://schema.org/address>/<http://schema.org/postalCode>",
                required: false,
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedCount: 1,
        expectedMatchValue: true,
        expectedName: "Roy Thomson Hall",
      },
      {
        description:
          "Reconcile Place with name and postal code and match should be false since postal code is incorrect",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Roy Thomson Hall",
              },
              {
                matchType: "property",
                propertyValue: "M5J 2H6", //incorrect postal code
                propertyId:
                  "<http://schema.org/address>/<http://schema.org/postalCode>",
                required: false,
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedCount: 1,
        expectedMatchValue: false,
        expectedName: "Roy Thomson Hall",
      },
      {
        description:
          "Reconcile Place with name, the match should be false since name is the only match",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Roy Thomson Hall",
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedCount: 1,
        expectedMatchValue: false,
        expectedName: "Roy Thomson Hall",
      },
      {
        description:
          "Reconcile Place with similar name, the match should be false since name is the only match",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Roy Thomson Hale", //incorrect name
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedCount: 1,
        expectedMatchValue: false, //Since name is the only match
        expectedName: "Roy Thomson Hall",
      },
      {
        description:
          "Reconcile Place with name and locality, the match should be true since all are exactly matching",
        queries: [
          {
            type: "schema:Place",
            limit: 1,
            conditions: [
              {
                matchType: "name",
                propertyValue: "Roy Thomson Hall", //correct name
              },
              {
                matchType: "property",
                propertyValue: "Toronto",
                propertyId:
                  "<http://schema.org/address>/<http://schema.org/addressLocality>",
              },
            ],
          },
        ],
        expectedId: "K11-19",
        expectedCount: 1,
        expectedMatchValue: true,
        expectedName: "Roy Thomson Hall",
      },
      {
        description: "Reconcile by a skos:hiddenLabel 'Famille'",
        queries: [
          {
            type: "skos:Concept",
            limit: 1,
            conditions: [{ matchType: "name", propertyValue: "Famille" }],
          },
        ],
        expectedId: "ChildrensEvent",
        expectedCount: 1,
        expectedMatchValue: false,
        expectedName: "Children's Event",
      },
      {
        description: "Reconcile by a skos:altLabel 'occurrence'",
        queries: [
          {
            type: "skos:Concept",
            limit: 1,
            conditions: [{ matchType: "name", propertyValue: "occurrence" }],
          },
        ],
        expectedId: "Festival",
        expectedCount: 1,
        expectedMatchValue: false,
        expectedName: "Festival",
      },
      {
        description: "Reconcile by a skos:prefLabel 'occurrence'",
        queries: [
          {
            type: "skos:Concept",
            limit: 1,
            conditions: [{ matchType: "name", propertyValue: "pour enfants" }],
          },
        ],
        expectedId: "ChildrensEvent",
        expectedCount: 1,
        expectedMatchValue: false,
        expectedName: "Children's Event",
      },

      //TODO this should eventually pass when all the URLs are converted to URLS in graphdb
      // {
      //   description: "Reconcile Place with required param as TRUE and matchQuantifier as ANY" ,
      //   queries: [
      //     {
      //       "type": "schema:Place" ,
      //       "limit": 2 ,
      //       "conditions": [
      //         {
      //           "matchType": "name" ,
      //           "propertyValue": "Roy Thomson Hall"
      //         } ,
      //         {
      //           "matchType": "property" ,
      //           "propertyValue": "https://www.roythomsonhall.com" ,
      //           "propertyId": "schema:url" ,
      //           "required": true ,
      //           "matchQuantifier": MatchQuantifierEnum.ALL
      //         }
      //       ]
      //     }
      //   ] ,
      //   expectedId: "K11-19" ,
      //   expectedName: "Roy Thomson Hall" ,
      //   expectedCount: 1
      // }
    ];

    for (const test of testCases) {
      it(test.description, async () => {
        const result = await reconService.reconcileByQueries(
          LanguageEnum.ENGLISH,
          { queries: test.queries },
        );
        let title = result.results?.[0]?.candidates?.[0]?.name;
        const id = result.results?.[0]?.candidates?.[0]?.id;

        if (title) {
          expect(title).toBe(test.expectedName);
        }

        expect(result.results?.[0]?.candidates?.length).toBe(
          test.expectedCount,
        );

        if (test.expectedMatchValue !== undefined) {
          expect(result.results?.[0]?.candidates?.[0]?.match).toBe(
            test.expectedMatchValue,
          );
        }

        if (test.expectedId) {
          expect(id).toBe(test.expectedId);
        }
      });
    }
  });
});
