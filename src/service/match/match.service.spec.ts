import { Test , TestingModule } from "@nestjs/testing";
import { ArtsdataService , HttpService , ManifestService , MatchService } from "../../service";
import { ManifestController , MatchController } from "../../controller";
import { LanguageTagEnum , MatchQualifierEnum , MatchQuantifierEnum } from "../../enum";

describe("Recon Service tests" , () => {
  let reconService: MatchService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ManifestController , MatchController] ,
      providers: [ManifestService , MatchService , ArtsdataService , HttpService]
    }).compile();

    reconService = app.get<MatchService>(MatchService);
  });

  describe("Recon API Tests" , () => {
    jest.setTimeout(200000);
    const testCases = [
      {
        description: "It should search for uris that match 100%" ,
        queries: [
          {
            type: "schema:Place" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "Théâtre Maisonneuve"
              }
            ]
          }
        ] ,
        expectedName: "Place des Arts - Théâtre Maisonneuve" ,
        expectedCount: 1
      } , {
        description: "It should search for uris by matching name in substring" ,
        queries: [
          {
            type: "schema:Place" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "The locations is in the lovely Bluma Appel Theatre and Berkeley Street Theatre."
              }
            ]
          }
        ] ,
        expectedName: "St. Lawrence Centre for the Arts - Bluma Appel Theatre" ,
        expectedCount: 1

      } , {
        description: "It should search for VaughnCo Entertainment presents" ,
        queries: [
          {
            type: "schema:Organization" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "VaughnCo Entertainment presents"
              }
            ]
          }
        ] ,
        expectedName: "VaughnCo Entertainment" ,
        expectedCount: 1
      } , {
        description: "It should search for Wajdi Mouawad" ,
        queries: [
          {
            type: "schema:Person" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "Wajdi Mouawad"
              }
            ]
          }
        ] ,
        expectedName: "Wajdi Mouawad" ,
        expectedCount: 1
      } , {
        description: "It should search for nowhere" ,
        queries: [
          {
            type: "schema:Place" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "Show is nowhere"
              }
            ]
          }
        ] ,
        expectedName: undefined ,
        expectedCount: 0
      } , {
        description: "It should remove duplicates" ,
        queries: [
          {
            type: "schema:Place" ,
            limit: 2 ,
            conditions: [
              {
                matchType: "name" ,
                v: "The locations is in the lovely Berkeley Street Theatre and Canadian Stage - Berkeley Street Theatre."
              }
            ]
          }
        ] ,
        expectedName: "Canadian Stage - Berkeley Street Theatre" ,
        expectedCount: 1 ,
        duplicateCheck: true
      } , {
        description: "It should match names with single neutral quote" ,
        queries: [
          {
            type: "schema:Place" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "Shippagan 20 h 00 La P'tite Église (Shippagan)"
              }
            ]
          }
        ] ,
        expectedName: "La P'tite Église (Shippagan)" ,
        expectedCount: 1
      } , {
        description: "It should match names with single curved quote" ,
        queries: [
          {
            type: "schema:Person" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "Emily D’Angelo"
              }
            ]
          }
        ] ,
        expectedName: "Emily D’Angelo" ,
        expectedCount: 1
      } , {
        description: "It should match names with &" ,
        queries: [
          {
            type: "schema:Organization" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "meagan&amp;amy"
              }
            ]
          }
        ] ,
        expectedName: "meagan&amy" ,
        expectedCount: 1
      } , {
        description: "It should match places with title in French" ,
        queries: [
          {
            type: "schema:Place" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "Théâtre Marc Lescarbot"
              }
            ]
          }
        ] ,
        expectedName: "le Marc Lescarbot (Pointe-de-l’église)" ,
        expectedCount: 1
      } , {
        description: "It should find alternate names" ,
        queries: [
          {
            type: "schema:Place" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "Shell Theatre"
              }
            ]
          }
        ] ,
        expectedName: "Dow Centennial Centre - Shell Theatre" ,
        expectedCount: 1
      } , {
        description: "It should find additional type using artsdata" ,
        queries: [
          {
            type: "ado:EventType" ,
            limit: 1 ,
            conditions: [
              {
                matchType: "name" ,
                v: "Dance"
              }
            ]
          }
        ] ,
        expectedName: "Dance" ,
        expectedCount: 1
      } , {
        description: "Reconcile a Place with Artsdata ID" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "K11-19"
              }
            ]
          }
        ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with Artsdata URI" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "http://kg.artsdata.ca/resource/K11-19"
              }
            ]
          }]
        ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with Name" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Roy Thomson Hall"
              }
            ]
          }
        ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with Name" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Roy Thomson Hall"
              }
            ]
          }
        ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with Name and Postal code" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Roy Thomson"
              } , {
                "matchType": "property" ,
                "v": "M5J 2H5" ,
                "pid": "schema:address/schema:postalCode" ,
                "required": true
              }
            ]
          }
        ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with Name and Street Address" ,
        queries:
          [
            {
              "type": "schema:Place" ,
              "limit": 1 ,
              "conditions": [
                {
                  "matchType": "name" ,
                  "v": "Roy Thomson"
                } , {
                  "matchType": "property" ,
                  "v": "60 Simcoe Street" ,
                  "pid": "schema:address/schema:streetAddress" ,
                  "required": true
                }
              ]
            }
          ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Event with Name" ,
        queries: [
          {
            "type": "schema:Event" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Matilda - Citadel Theatre"
              }
            ]
          }
        ] ,
        expectedId: "citadeltheatre-com_2018-2019_matilda" ,
        expectedName: "Matilda - Citadel Theatre" ,
        expectedCount: 1
      } , {
        description: "Reconcile Event with Name and startDate" ,
        queries: [
          {
            "type": "schema:Event" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Matilda - Citadel Theatre" ,
                "pid": "string" ,
                "required": true
              } ,
              {
                "matchType": "property" ,
                "v": "2019-03-17T13:30:00-04:00" ,
                "pid": "schema:startDate" ,
                "required": true
              }
            ]
          }
        ] ,
        expectedId: "citadeltheatre-com_2018-2019_matilda#2019-03-17T133000-0400" ,
        expectedName: "Matilda - Citadel Theatre" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with only URL" ,
        queries: [
          {
            "type": "schema:Place" ,
            "conditions": [
              {
                "matchType": "property" ,
                "v": "https://www.roythomsonhall.com" ,
                "pid": "schema:url" ,
                "required": true
              }
            ]
          }
        ] , expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with only sameAs" ,
        queries: [
          {
            "type": "schema:Place" ,
            "conditions": [

              {
                "matchType": "property" ,
                "v": "https://en.wikipedia.org/wiki/Roy_Thomson_Hall" ,
                "pid": "schema:sameAs" ,
                "required": true
              }
            ]
          }
        ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with required as TRUE" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Roy Thomson"
              } ,
              {
                "matchType": "property" ,
                "v": "https://en.wikipedia.org/wiki/Roy_Thomson_Hall" ,
                "pid": "schema:sameAs" ,
                "required": true
              }
            ]
          }
        ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with required param as FALSE" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Roy Thomson"
              } ,
              {
                "matchType": "property" ,
                "v": "https://some.wrong.url" ,
                "pid": "schema:url" ,
                "required": false
              }
            ]
          }
        ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with NO required param" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Roy Thomson"
              } ,
              {
                "matchType": "property" ,
                "v": "https://some.wrong.url" ,
                "pid": "schema:url"
              }
            ]
          }
        ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with required param as TRUE and matchQualifier as RegexMatch" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Roy Thomson"
              } ,
              {
                "matchType": "property" ,
                "v": "https://www.roythomson.*" ,
                "pid": "schema:url" ,
                "required": true ,
                "matchQualifier": MatchQualifierEnum.REGEX_MATCH
              }
            ]
          }
        ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      } , {
        description: "Reconcile Place with required param as TRUE and matchQualifier as RegexMatch" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 1 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Roy Thomson"
              } ,
              {
                "matchType": "property" ,
                "v": "https://www.roythomson.*" ,
                "pid": "schema:url" ,
                "required": true ,
                "matchQualifier": MatchQualifierEnum.EXACT_MATCH
              }
            ]
          }
        ] ,
        expectedCount: 0
      } , {
        description: "Reconcile Place with required param as TRUE and matchQuantifier as none" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 2 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Roy Thomson Hall"
              } ,
              {
                "matchType": "property" ,
                "v": "https://www.roythomsonhall.com" ,
                "pid": "schema:url" ,
                "required": true ,
                "matchQuantifier": MatchQuantifierEnum.NONE
              }
            ]
          }
        ] ,
        expectedId: "K11-239" ,
        expectedCount: 1 ,
        expectedName: "Roy Barnett Recital Hall"
      }, {
        description: "Reconcile Place with required param as TRUE and matchQuantifier as ANY" ,
        queries: [
          {
            "type": "schema:Place" ,
            "limit": 2 ,
            "conditions": [
              {
                "matchType": "name" ,
                "v": "Roy Thomson Hall"
              } ,
              {
                "matchType": "property" ,
                "v": "https://www.roythomsonhall.com" ,
                "pid": "schema:url" ,
                "required": true ,
                "matchQuantifier": MatchQuantifierEnum.ALL
              }
            ]
          }
        ] ,
        expectedId: "K11-19" ,
        expectedName: "Roy Thomson Hall" ,
        expectedCount: 1
      }
    ];

    for (const test of testCases) {
      it(test.description , async () => {
        const result = await reconService
          .reconcileByQueries({ queries: test.queries });
        let title = result.results?.[0]?.candidates?.[0]?.name;
        const id = result.results?.[0]?.candidates?.[0]?.id;
        title = title instanceof String ? title : (title as any)?.values.find((value: {
          lang: string;
          str: string
        }) => value.lang === LanguageTagEnum.ENGLISH || value.lang === LanguageTagEnum.FRENCH || value.lang === undefined).str;
        //TODO the ado:EventType query is not returning schema:name instead it is returning skos:prefLabel
        if (title)
          expect(title).toBe(test.expectedName);
        expect(result.results?.[0].candidates.length).toBe(test.expectedCount);
        if (test.duplicateCheck) {
          expect(result.results[0]?.candidates?.[0]?.name === result.results[0]?.candidates?.[1]?.name).toBeFalsy();
        }
        if (test.expectedId) {
          expect(id).toBe(test.expectedId);
        }
      });
    }
  });

});
