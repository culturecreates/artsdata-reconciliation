export const QUERIES = {

  RECONCILITAION_QUERY:`
PREFIX luc: <http://www.ontotext.com/connectors/lucene#>
PREFIX luc-index: <http://www.ontotext.com/connectors/lucene/instance#>
PREFIX schema: <http://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ado: <http://kg.artsdata.ca/ontology/>

SELECT 
 ?entity 
 ?score 
 ?name
 (sample(?disambiguatingDescriptions) as ?disambiguatingDescription) 
 ?type 
    ?typeLabel
WHERE
{
    values ?query { "QUERY_PLACE_HOLDER" }
    values ?type { TYPE_PLACE_HOLDER }

    ?search a luc-index:INDEX_PLACE_HOLDER ;
      luc:query ?query ;
      luc:entities ?entity .
     #FILTER (STRSTARTS(STR(?entity),"http://kg.artsdata.ca/resource/K" ))
 
    ?entity luc:score ?score.
    ?entity rdfs:label ?name.
    
    OPTIONAL { ?originalUri  schema:disambiguatingDescription ?disambiguatingDescriptions.}
    OPTIONAL { ?type rdfs:label ?type_label_raw filter(lang(?type_label_raw) IN ("", "en" )) 
        BIND(COALESCE(?type_label_en, ?type_label_raw, "") as ?typeLabel)
    }

}GROUP BY ?entity ?score ?name ?type ?typeLabel  
  `

};
