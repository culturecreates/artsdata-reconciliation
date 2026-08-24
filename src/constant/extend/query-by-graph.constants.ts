export const QUERY_BY_GRAPH = {
  GENERIC: `PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
SELECT ?uri 
(SAMPLE(?urls) AS ?url)
(SAMPLE(?name) AS ?name)
(SAMPLE(?isni_uris) AS ?isni_uri)
(COALESCE(SAMPLE(?adid), SAMPLE(?adid_int), SAMPLE(?adid_ext)) AS ?artsdata_uri)
(COALESCE(SAMPLE(?wikidata_ids), SAMPLE(?wikidata_self)) AS ?wikidata_uri)
(GROUP_CONCAT(DISTINCT ?types;
        SEPARATOR = ", ") AS ?type)
?is_flagged_for_review
?reconciled
(SAMPLE(?disambiguating_descriptions) AS ?disambiguating_description)
<EXTRA_FIELD_SELECT_CLAUSE_QUERY_PLACEHOLDER>
WHERE {
    
   <FILTER_BY_ENTITY_URIS_PLACEHOLDER>
   
   ?allSubClasses rdfs:subClassOf* TYPE_PLACEHOLDER .

    GRAPH <GRAPH_URI_PLACEHOLDER> {
        
        ?uri a ?allSubClasses.
        
        OPTIONAL {
            ?uri schema:name ?name_en.
            FILTER(LANG(?name_en) = "en") 
        }
        OPTIONAL {
            ?uri schema:name ?name_fr.
            FILTER(LANG(?name_fr) = "fr") 
        }
        OPTIONAL {
            ?uri schema:name ?name_default.
            FILTER(LANG(?name_default) = "") 
        }
        OPTIONAL {
            ?uri schema:name ?name_mul.
            FILTER(LANG(?name_mul) = "mul") 
        }
        BIND(COALESCE(?name_en, ?name_fr, ?name_mul, ?name_default) AS ?name)
        FILTER(!ISBLANK(STR(?name)))
        OPTIONAL {
            ?uri schema:disambiguatingDescription ?desc_en.
            FILTER(LANG(?desc_en) = "en") 
        }
        OPTIONAL {
            ?uri schema:disambiguatingDescription ?desc_fr.
            FILTER(LANG(?desc_fr) = "fr") 
        }
        OPTIONAL {
            ?uri schema:disambiguatingDescription ?desc_default.
            FILTER(LANG(?desc_default) = "") 
        }
        OPTIONAL {
            ?uri schema:disambiguatingDescription ?desc_mul.
            FILTER(LANG(?desc_mul) = "mul") 
        }
        BIND(COALESCE(?desc_en, ?desc_fr,?desc_mul, ?desc_default) AS ?disambiguating_descriptions)
        ?uri a ?types.
            <FILTER_BY_REGION_PLACEHOLDER>
        FILTER(!ISBLANK(?uri))
        OPTIONAL {
            ?uri schema:sameAs ?adid_ext.
            FILTER(STRSTARTS(STR(?adid_ext), "http://kg.artsdata.ca/resource/K")) 
        }
        OPTIONAL {
            ?adid_int schema:sameAs ?uri.
            FILTER(STRSTARTS(STR(?adid_int), "http://kg.artsdata.ca/resource/K"))
        }
          <EXTRA_FIELD_WHERE_CLAUSE_QUERY_PLACEHOLDER>
        OPTIONAL {
            ?uri schema:url ?urls.
            FILTER(!ISBLANK(?urls)) 
        }
        OPTIONAL {
            ?uri schema:sameAs ?wikidata_ids.
            FILTER(STRSTARTS(STR(?wikidata_ids), "http://www.wikidata.org/entity/")) 
        }
        OPTIONAL {
            FILTER(STRSTARTS(STR(?uri), "http://www.wikidata.org/entity/")) 
            BIND(?uri AS ?wikidata_self) 
        }
        OPTIONAL {
            ?uri schema:sameAs ?isni_uris.
            FILTER(STRSTARTS(STR(?isni_uris), "https://isni.org/isni/")) 
        }
    }
    
    OPTIONAL {
            ?uri schema:additionalType <http://kg.artsdata.ca/ontology/FlaggedForReview>.
            BIND(TRUE AS ?flaggedForReview) 
        }
        
    GRAPH <http://kg.artsdata.ca/core>{
        OPTIONAL {
            ?uri schema:sameAs ?adid.
            FILTER(STRSTARTS(STR(?adid), "http://kg.artsdata.ca/resource/K")) 
            BIND(TRUE AS ?reconciled) 
        }
    }
} 
GROUP BY ?uri ?reconciled ?is_flagged_for_review
ORDER BY ?name
LIMIT LIMIT_PLACEHOLDER
OFFSET OFFSET_PLACEHOLDER`,
};
