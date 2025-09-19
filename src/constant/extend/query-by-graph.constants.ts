export const QUERY_BY_GRAPH = {
  GENERIC: `PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
SELECT ?uri 
  (SAMPLE(?urls) AS ?url)
  (SAMPLE(?name) AS ?name)
  (SAMPLE(?isni_uris) AS ?isni_uri)
  (SAMPLE(?adid_obj) AS ?artsdata_uri)
  (SAMPLE(?wikidata_ids) AS ?wikidata_uri)
  (GROUP_CONCAT(DISTINCT ?types; SEPARATOR = ", ") AS ?type)
  (MAX(?flaggedForReview) AS ?is_flagged_for_review)
  <EXTRA_FIELD_SELECT_CLAUSE_QUERY_PLACEHOLDER>
WHERE {
  GRAPH <GRAPH_URI_PLACEHOLDER> {
    OPTIONAL { ?uri schema:name ?name_en. FILTER(LANG(?name_en) = "en") }
    OPTIONAL { ?uri schema:name ?name_fr. FILTER(LANG(?name_fr) = "fr") }
    OPTIONAL { ?uri schema:name ?name_no. FILTER(LANG(?name_no) = "") }
    BIND(COALESCE(?name_en, ?name_fr, ?name_no) AS ?name)
    FILTER(!ISBLANK(STR(?name)))
    ?uri a ?types.
    <FILTER_BY_REGION_PLACEHOLDER>
  }
  ?uri a TYPE_PLACEHOLDER.
  FILTER(!ISBLANK(?uri))
  OPTIONAL {
    ?adids schema:sameAs ?uri.
    FILTER(STRSTARTS(STR(?adids), "http://kg.artsdata.ca/resource/K"))
  }
  OPTIONAL { 
    ?uri schema:additionalType <http://kg.artsdata.ca/ontology/FlaggedForReview>. 
    BIND(TRUE AS ?flaggedForReview) 
  }
  <EXTRA_FIELD_WHERE_CLAUSE_QUERY_PLACEHOLDER>
  OPTIONAL { 
    ?uri schema:sameAs ?adid_obj. 
    FILTER(STRSTARTS(STR(?adid_obj), "http://kg.artsdata.ca/resource/K")) 
  }
  OPTIONAL { ?uri schema:url ?urls. FILTER(!ISBLANK(?urls)) }
  OPTIONAL { 
    ?uri schema:sameAs ?wikidata_ids. 
    FILTER(STRSTARTS(STR(?wikidata_ids), "http://www.wikidata.org/entity/")) 
  }
  OPTIONAL { 
    ?uri schema:sameAs ?isni_uris. 
    FILTER(STRSTARTS(STR(?isni_uris), "https://isni.org/isni/")) 
  }
} 
GROUP BY ?uri
ORDER BY ?uri
LIMIT LIMIT_PLACEHOLDER
OFFSET OFFSET_PLACEHOLDER` ,
};