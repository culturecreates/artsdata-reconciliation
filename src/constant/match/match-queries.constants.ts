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
   ?score
   (SAMPLE(?name_en) AS ?nameEn)
   (SAMPLE(?name_fr) AS ?nameFr)
   (SAMPLE(?name_no) AS ?name)
   (SAMPLE(?description_no) AS ?description)
   (SAMPLE(?description_en) AS ?descriptionEn)
   (SAMPLE(?description_fr) AS ?descriptionFr)
   (SAMPLE(?postalCode) AS ?postalCode)
   (SAMPLE(?addressLocality) AS ?addressLocality)
   (SAMPLE(?url) AS ?url)
   ?type_label
 WHERE {
   {
   SELECT_ENTITY_QUERY_BY_KEYWORD_PLACEHOLDER
   }
 
   OPTIONAL { ?entity schema:name | skos:prefLabel ?name_en. FILTER(LANG(?name_en) = "en") }
   OPTIONAL { ?entity schema:name | skos:prefLabel ?name_fr. FILTER(LANG(?name_fr) = "fr") }
   OPTIONAL { ?entity schema:name | skos:prefLabel ?name_no. FILTER(LANG(?name_no) = "") }
 
   ?entity a ?type_additional.
   OPTIONAL { ?type_additional rdfs:label ?type_label_raw FILTER(LANG(?type_label_raw) = "") }
   OPTIONAL { ?type_additional rdfs:label ?type_label_en FILTER(LANG(?type_label_en) = "en") }
   BIND(COALESCE(?type_label_en, ?type_label_raw, "") AS ?type_label)
 
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_en. FILTER(LANG(?description_en) = "en") }
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_fr. FILTER(LANG(?description_fr) = "fr") }
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_no. FILTER(LANG(?description_no) = "") }
 
   OPTIONAL { ?entity schema:url ?url }
   OPTIONAL { 
    ?entity schema:location ?place 
   OPTIONAL { ?place schema:address/schema:postalCode ?postalCode }
   OPTIONAL { ?place schema:address/schema:addressLocality ?addressLocality }
   }
   
 }
 GROUP BY ?entity ?score ?type_label`,

  SELECT_ENTITY_QUERY_BY_KEYWORD: `
 SELECT ?entity ?score WHERE {
   QUERY_PLACE_HOLDER
   ?search a luc-index:INDEX_PLACE_HOLDER;
     QUERY_FILTER_PLACE_HOLDER
     luc:entities ?entity.
   PROPERTY_PLACE_HOLDER
   FILTER(STRSTARTS(STR(?entity), "${ArtsdataConstants.PREFIX}"))
   ?entity luc:score ?score;
 } LIMIT_PLACE_HOLDER`,
};
