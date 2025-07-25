export const QUERY_BY_GRAPH = {
  GENERIC: `PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
SELECT ?uri ?url
(sample(?name_language) as ?name)  
(sample(?isnis) as ?isni_uri)
(sample(?adids) as ?artsdata_uri)
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
    
    OPTIONAL {?uri schema:url ?url}
  
    OPTIONAL {
      ?uri schema:sameAs ?adid_obj .
      FILTER(contains(str(?adid_obj),"http://kg.artsdata.ca/resource/K"))
    }
    
    OPTIONAL {
      ?uri schema:sameAs ?wikidata_ids .
      FILTER(contains(str(?wikidata_ids),"http://www.wikidata.org/entity/"))
    }
    
    OPTIONAL {
      ?uri schema:sameAs ?isnis .
      FILTER(contains(str(?isnis),"https://isni.org/isni/"))
    }
    
    BIND(COALESCE(?adid_obj, ?adid_sub) as ?adid)
} GROUP BY ?uri ?url
ORDER BY ?uri 
LIMIT LIMIT_PLACEHOLDER
OFFSET OFFSET_PLACEHOLDER` ,

};