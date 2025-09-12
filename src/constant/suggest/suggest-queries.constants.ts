export const SUGGEST_QUERY = {
  ENTITY: `
  PREFIX luc: <http://www.ontotext.com/connectors/lucene#>
  PREFIX luc-index: <http://www.ontotext.com/connectors/lucene/instance#>
  PREFIX schema: <http://schema.org/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX ado: <http://kg.artsdata.ca/ontology/>
  PREFIX dbo: <http://dbpedia.org/ontology/>
  
  SELECT DISTINCT
    ?entity
    ?name
    ?description
    ?image
    ?typeLabel
  WHERE {
    {
      SELECT ?entity WHERE {
        VALUES ?query { "QUERY_PLACE_HOLDER" }
        ?search a luc-index:INDEX_PLACE_HOLDER;
                luc:query ?query;
                luc:entities ?entity.
        ?entity schema:name | rdfs:label ?entityName.
        FILTER(STRSTARTS(LCASE(?entityName), "QUERY_PLACEHOLDER"))
        FILTER_CONDITION_PLACEHOLDER
      } LIMIT 10
    }
  
    # NAME
    OPTIONAL { ?entity schema:name | rdfs:label ?name_en. FILTER(LANG(?name_en) = "en") }
    OPTIONAL { ?entity schema:name | rdfs:label ?name_fr. FILTER(LANG(?name_fr) = "fr") }
    OPTIONAL { ?entity schema:name | rdfs:label ?name_raw. FILTER(LANG(?name_raw) = "") }
    BIND(COALESCE(?name_en, ?name_fr, ?name_raw) AS ?name)
  
    # DISAMBIGUATING DESCRIPTION
    OPTIONAL { ?entity schema:disambiguatingDescription ?description_en. FILTER(LANG(?description_en) = "en") }
    OPTIONAL { ?entity schema:disambiguatingDescription ?description_fr. FILTER(LANG(?description_fr) = "fr") }
    OPTIONAL { ?entity schema:disambiguatingDescription ?description_raw. FILTER(LANG(?description_raw) = "") }
    BIND(COALESCE(?description_en, ?description_fr, ?description_raw) AS ?description)
  
    # TYPE
    ?entity a ?type_additional.
    OPTIONAL { ?type_additional rdfs:label ?type_label_raw. FILTER(LANG(?type_label_raw) = "") }
    OPTIONAL { ?type_additional rdfs:label ?type_label_en. FILTER(LANG(?type_label_en) = "en") }
    OPTIONAL { ?type_additional rdfs:label ?type_label_fr. FILTER(LANG(?type_label_fr) = "fr") }
    BIND(COALESCE(?type_label_en, ?type_label_fr, ?type_label_raw) AS ?typeLabel)
  
    # IMAGE
    OPTIONAL { ?entity schema:image ?imageURL }
    OPTIONAL { ?entity schema:image/schema:url ?imageURLFromObject }
    BIND(COALESCE(?imageURLFromObject, ?imageURL) AS ?image)
  }
  GROUP BY ?entity ?name ?description ?image ?typeLabel
  `
};