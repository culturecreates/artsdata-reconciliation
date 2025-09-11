export const QUERY_BY_GRAPH = {
  GENERIC: `PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
SELECT ?uri 
(sample(?urls) as ?url)
(COALESCE(sample(?name_en), sample(?name_fr), sample(?name_no)) as ?name)
(sample(?isni_uris) as ?isni_uri)
(sample(?adid_obj) as ?artsdata_uri)
(sample (?wikidata_ids) as ?wikidata_uri)
(GROUP_CONCAT(DISTINCT ?types ; SEPARATOR = ", ") AS ?type)
(MAX(?flaggedForReview) AS ?is_flagged_for_review)
<EXTRA_FIELD_SELECT_CLAUSE_QUERY_PLACEHOLDER>
WHERE {
    graph <GRAPH_URI_PLACEHOLDER> {
           
      OPTIONAL { ?uri schema:name   ?name_en. FILTER( LANG(?name_en) = "en")}
      OPTIONAL { ?uri schema:name  ?name_fr. FILTER( LANG(?name_fr) = "fr")}
      OPTIONAL { ?uri schema:name  ?name_no. FILTER ( LANG(?name_no) = "")}
            ?uri a ?types  .
    }
    
    ?uri a TYPE_PLACEHOLDER . 
    FILTER(!isBlank(?uri))
    OPTIONAL {
      ?adids schema:sameAs ?uri .
      FILTER(STRSTARTS(str(?adids),"http://kg.artsdata.ca/resource/K"))
    }
    
    # Flagged for review
    OPTIONAL { ?uri schema:additionalType <http://kg.artsdata.ca/ontology/FlaggedForReview> 
               BIND(true AS ?flaggedForReview) }
    
    <EXTRA_FIELD_WHERE_CLAUSE_QUERY_PLACEHOLDER>
    
    OPTIONAL {
      ?uri schema:sameAs ?adid_obj .
      FILTER(STRSTARTS(str(?adid_obj),"http://kg.artsdata.ca/resource/K"))
    }

    OPTIONAL {?uri schema:url ?urls
    FILTER(!isBlank(?urls))}

    OPTIONAL {
      ?uri schema:sameAs ?wikidata_ids .
      FILTER(STRSTARTS(str(?wikidata_ids),"http://www.wikidata.org/entity/"))
    }
    
    OPTIONAL {
      ?uri schema:sameAs ?isni_uris .
      FILTER(STRSTARTS(str(?isni_uris),"https://isni.org/isni/"))
    }
    
} GROUP BY ?uri
ORDER BY ?uri 
LIMIT LIMIT_PLACEHOLDER
OFFSET OFFSET_PLACEHOLDER` ,

};