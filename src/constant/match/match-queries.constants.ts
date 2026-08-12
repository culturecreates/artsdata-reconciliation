import { ArtsdataConstants } from "../shared";

export const QUERIES = {
  RECONCILIATION_QUERY: `
 PREFIX luc: <http://www.ontotext.com/connectors/lucene#>
 PREFIX luc-index: <http://www.ontotext.com/connectors/lucene/instance#>
 PREFIX schema: <http://schema.org/>
 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
 PREFIX ado: <http://kg.artsdata.ca/ontology/>
 PREFIX dbo: <http://dbpedia.org/ontology/>
 PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
 
 SELECT DISTINCT
   ?entity
   ?total_score
   (SAMPLE(?name) AS ?name)
   (SAMPLE(?description) AS ?description)
   (SAMPLE(?url) AS ?url)
   ?type_label
   ?type
   ADDITIONAL_SELECT_FOR_MATCH_PLACEHOLDER
 WHERE {
   {
   SELECT_ENTITY_QUERY_BY_KEYWORD_PLACEHOLDER
   }
    
   VALUES ?requestLanguage { "REQUEST_LANG_PLACEHOLDER" } 
 
   OPTIONAL { ?entity schema:name | skos:prefLabel ?name_en. FILTER(LANG(?name_en) = "en") }
   OPTIONAL { ?entity schema:name | skos:prefLabel ?name_fr. FILTER(LANG(?name_fr) = "fr") }
   OPTIONAL { ?entity schema:name | skos:prefLabel ?name_no. FILTER(LANG(?name_no) = "") }
   OPTIONAL { ?entity schema:name | skos:prefLabel ?name_mul. FILTER(LANG(?name_mul) = "mul") }
   
    BIND(
    IF(?requestLanguage = "fr",
       COALESCE(?name_fr, ?name, ?name_mul, ?name_en),
       COALESCE(?nameEn, ?name,  ?name_mul, ?name_fr))
    AS ?name
  )
 
   ?entity a ?type.
   OPTIONAL { ?type rdfs:label ?type_label_raw FILTER(LANG(?type_label_raw) = "") }
   OPTIONAL { ?type rdfs:label ?type_label_en FILTER(LANG(?type_label_en) = "en") }
   BIND(COALESCE(?type_label_en, ?type_label_raw, "") AS ?type_label)
 
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_en. FILTER(LANG(?description_en) = "en") }
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_fr. FILTER(LANG(?description_fr) = "fr") }
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_no. FILTER(LANG(?description_no) = "") }
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_mul. FILTER(LANG(?description_mul) = "mul") }
 
    BIND(
    IF(?requestLanguage = "fr",
       COALESCE(?description_fr, ?name, ?description_mul, ?description_en),
       COALESCE(?description_en, ?name,  ?description_mul, ?description_fr))
    AS ?description
  )
  
   OPTIONAL { ?entity schema:url ?url }
   
   ADDITIONAL_TRIPLES_FOR_MATCH_PLACEHOLDER
   
 }
 GROUP_BY_PLACEHOLDER`,

  SELECT_ENTITY_QUERY_BY_KEYWORD: `
 SELECT ?entity ?total_score WHERE {
   ?search a luc-index:INDEX_PLACE_HOLDER ;
     QUERY_FILTER_PLACE_HOLDER
     luc:entities ?entity .
   PROPERTY_PLACE_HOLDER
   FILTER(STRSTARTS(STR(?entity), "${ArtsdataConstants.PREFIX}"))
   ?entity luc:score ?total_score .
   FILTER(?total_score > 0)
 } GROUP BY ?entity ?total_score
  LIMIT_PLACE_HOLDER`,

  GROUP_BY_STATEMENT: `GROUP BY ?entity ?total_score ?type_label ?type`,

};
