export const QUERY_BY_GRAPH = {
  GENERIC: `PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
SELECT ?uri 
(sample(?urls) as ?url)
(sample(?name_language) as ?name)  
(sample(?isni_uris) as ?isni_uri)
(sample(?artsdata_uris) as ?artsdata_uri)
(sample (?wikidata_ids) as ?wikidata_uri)
(GROUP_CONCAT(?types ; SEPARATOR = ", ") AS ?type)
WHERE {
    graph <GRAPH_URI_PLACEHOLDER> {
        ?uri schema:name ?name_language;
                 a ?types  .
    }
    
    ?uri a schema:TYPE_PLACEHOLDER . 
    OPTIONAL {
      ?adids schema:sameAs ?uri .
      FILTER(contains(str(?adids),"http://kg.artsdata.ca/resource/K"))
    }
    
    OPTIONAL {
      ?uri schema:sameAs ?adid_obj .
      FILTER(contains(str(?adid_obj),"http://kg.artsdata.ca/resource/K"))
    }
    BIND(COALESCE(?adid_obj, ?adid_sub) as ?artsdata_uris)

    OPTIONAL {?uri schema:url ?urls}

    OPTIONAL {
      ?uri schema:sameAs ?wikidata_ids .
      FILTER(contains(str(?wikidata_ids),"http://www.wikidata.org/entity/"))
    }
    
    OPTIONAL {
      ?uri schema:sameAs ?isni_uris .
      FILTER(contains(str(?isni_uris),"https://isni.org/isni/"))
    }
    
} GROUP BY ?uri
ORDER BY ?uri 
LIMIT LIMIT_PLACEHOLDER
OFFSET OFFSET_PLACEHOLDER` ,

};