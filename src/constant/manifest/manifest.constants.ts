import {APPLICATION} from "../../config";

export const MANIFEST =
    {
        "versions": [
            "1.0-draft"
        ],
        "name": "Artsdata.ca Reconciliation Service",
        "defaultTypes": [
            {
                "id": "schema:Event",
                "name": "Event"
            },
            {
                "id": "schema:Person",
                "name": "Person"
            },
            {
                "id": "schema:Place",
                "name": "Place"
            },
            {
                "id": "dbo:Agent",
                "name": "Agent"
            },
            {
                "id": "schema:Organization",
                "name": "Organization"
            },
            {
                "id": "skos:Concept",
                "name": "Concept"
            },
            {
                "id": "ado:EventType",
                "name": "Artsdata Event Type"
            },
            {
                "id": "ado:LivePerformanceWork",
                "name": "Artsdata Live Performance Work"
            }
        ],
        "extend": {
            "proposeProperties": true,
            "propertySettings": [
                {
                    "id": "limit",
                    "name": "Limit",
                    "type": "number",
                    "default": 0,
                    "helpText": "Maximum number of values to return per row (0 for no limit)"
                },
                {
                    "id": "content",
                    "name": "Content",
                    "type": "select",
                    "default": "literal",
                    "helpText": "Content type: ID or literal",
                    "choices": [
                        {
                            "value": "id",
                            "name": "ID"
                        },
                        {
                            "value": "literal",
                            "name": "Literal"
                        },
                        {
                            "value": "expand",
                            "name": "Expand"
                        }
                    ]
                }
            ],
            "propose_properties": {
                "service_url": "https://staging.recon.artsdata.ca",
                "service_path": "/extend/propose"
            }
        },
        "view": {
            "url": `${APPLICATION.KG_URL}resource/{{id}}`
        },
        "preview": {
            "height": 100,
            "width": 400,
            "url": "https://staging.recon.artsdata.ca/preview?id={{id}}"
        },
        "suggest": {
            "entity": true,
            "property": true,
            "type": true
        }
    }