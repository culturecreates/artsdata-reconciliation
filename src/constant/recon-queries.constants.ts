export const QUERIES = {

  RECONCILITAION_QUERY:`
        PREFIX luc: <http://www.ontotext.com/owlim/lucene#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        SELECT 
              ?originalUri
              ?score (sample(?names) as ?name)
              (sample(?disambiguatingDescriptions) as ?disambiguatingDescription) 
              ?type 
              ?typeLabel
        WHERE {
              values ?query { "QUERY_PLACE_HOLDER" }
              values ?type { TYPE_PLACE_HOLDER }
    
        ?originalUri a ?type ; 
                     luc:Name ?query;
                     rdfs:label ?names ;
                     luc:score ?score .
        FILTER (STRSTARTS(STR(?originalUri),"http://kg.artsdata.ca/resource/K" ))

        OPTIONAL {
                  ?originalUri  schema:disambiguatingDescription ?disambiguatingDescriptions .
        }
        
        OPTIONAL {
        ?type rdfs:label ?type_label_raw filter(lang(?type_label_raw) = "") 
        } 
        
        OPTIONAL {
        ?type rdfs:label ?type_label_en filter(lang(?type_label_en) = "en") 
        }
        
        BIND(COALESCE(?type_label_en, ?type_label_raw, "") as ?typeLabel)
    
        } GROUP BY ?originalUri ?score ?type ?typeLabel
  `



};
