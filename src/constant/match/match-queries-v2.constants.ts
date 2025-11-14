import {ArtsdataConstants} from "../shared";

export const QUERIES_V2 = {

    PREFIXES: `
PREFIX con-inst: <http://www.ontotext.com/connectors/lucene/instance#>
PREFIX con: <http://www.ontotext.com/connectors/lucene#>
PREFIX schema: <http://schema.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>`,

    SELECT_INDEXED_ENTITY_QUERY_TEMPLATE: `SELECT * {
        [] a con-inst:INDEX_PLACEHOLDER ;
        con:query "LUCENE_QUERY_PLACEHOLDER"  ;
        con:entities ?entity  .
        ?entity con:score PROPERTY_SCORE_VARIABLE_PLACEHOLDER.
        ?entity a PROPERTY_TYPE_PLACEHOLDER .
    }`,

    COMMON_SELECT_QUERY_FOR_ALL_ENTITY_PROPERTIES_SUB_QUERY: `
    (SAMPLE(?name_en) AS ?nameEn)
    (SAMPLE(?name_fr) AS ?nameFr)
    (SAMPLE(?name_default) AS ?name)
    (SAMPLE(?description_en) AS ?descriptionEn)
    (SAMPLE(?description_fr) AS ?descriptionFr)
    (SAMPLE(?description_default) AS ?description)
    ?type_label
    ?type
    ?total_score`,

    COMMON_PROPERTIES_TO_FETCH_QUERY: `
  # Name label
    OPTIONAL { ?entity schema:name | skos:prefLabel ?name_en FILTER(LANG(?name_en) = "en") }
    OPTIONAL { ?entity schema:name | skos:prefLabel ?name_fr FILTER(LANG(?name_fr) = "fr") }
    OPTIONAL { ?entity schema:name | skos:prefLabel ?name_no FILTER(LANG(?name_default) = "") }
  # Additional type labels
    OPTIONAL { 
        ?entity a ?type .
        OPTIONAL { ?type rdfs:label ?type_label_default FILTER(LANG(?type_label_default) = "") }
        OPTIONAL { ?type rdfs:label ?type_label_en FILTER(LANG(?type_label_en) = "en") }
        OPTIONAL { ?type rdfs:label ?type_label_fr FILTER(LANG(?type_label_fr) = "en") }
    BIND(COALESCE(?type_label_en, ?type_label_fr, ?type_label_default, "") AS ?type_label)
    }
  # Description
    OPTIONAL { ?entity schema:disambiguatingDescription ?description_en FILTER(LANG(?description_en) = "en") }
    OPTIONAL { ?entity schema:disambiguatingDescription ?description_fr FILTER(LANG(?description_fr) = "fr") }
    OPTIONAL { ?entity schema:disambiguatingDescription ?description_default FILTER(LANG(?description_default) = "") }
    #url
    OPTIONAL { ?entity schema:url ?url }`,


    SELECT_QUERY_FOR_AGENT_PROPERTIES_SUB_QUERY: `
    (SAMPLE(?wikidata) AS ?wikidata)\n(SAMPLE(?isni) AS ?isni)`,

    ADDITIONAL_PROPERTIES_TO_FETCH_FOR_AGENTS_SUB_QUERY: `
    # Wikidata and ISNI
    OPTIONAL { ?entity schema:sameAs ?sameAs 
        OPTIONAL {BIND(?sameAs AS ?wikidata)
            FILTER (STRSTARTS(str(?wikidata), "http://www.wikidata.org/entity/"))
        }
        OPTIONAL {BIND(?sameAs AS ?isni)
            FILTER (STRSTARTS(str(?isni), "https://isni.org/isni/"))
        }
    }`,

    SELECT_QUERY_FOR_EVENT_PROPERTIES_SUB_QUERY: `
    (SAMPLE(?startDate) AS ?startDate)
    (SAMPLE(?endDate) AS ?endDate)
    (SAMPLE(?locationName) AS ?locationName)
    (SAMPLE(?postalCode) AS ?postalCode)
    (SAMPLE(?artsdataUri) AS ?locationUri)`,

    ADDITIONAL_PROPERTIES_TO_FETCH_FOR_EVENTS_SUB_QUERY: `
    # Start date, end date, location, location URI and postal code
    OPTIONAL { ?entity schema:startDate ?startDate} 
    OPTIONAL { ?entity schema:endDate ?endDate} 
    OPTIONAL { ?entity schema:location ?location;
        OPTIONAL { ?location schema:name ?locationName }
        OPTIONAL { ?location schema:address/schema:postalCode ?postalCode }
        OPTIONAL { ?location schema:sameAs ?artsdataUri
            FILTER(STRSTARTS(STR(?artsdataUri), "${ArtsdataConstants.PREFIX_INCLUDING_K}")) 
        }
    }`,

    SELECT_QUERY_FOR_PLACE_PROPERTIES_SUB_QUERY: `
    (SAMPLE(?postalCode) AS ?postalCode)
    (SAMPLE(?addressLocality) AS ?addressLocality)
    (SAMPLE(?wikidata) AS ?wikidata)`,

    ADDITIONAL_PROPERTIES_TO_FETCH_FOR_PLACES_SUB_QUERY: `
    #Postal code, locality and Wikidata
    OPTIONAL { ?entity schema:address/schema:postalCode ?postalCode }
    OPTIONAL { ?entity schema:address/schema:addressLocality ?addressLocality }
    OPTIONAL { ?entity schema:sameAs ?wikidata 
        FILTER (STRSTARTS(str(?wikidata), "http://www.wikidata.org/entity/"))
    }`,
    COMMON_GROUP_BY_STATEMENT: `GROUP BY ?entity ?type ?type_label ?total_score`,

}

