export const QUERIES = {

  RECONCILITAION_QUERY:`
PREFIX luc: <http://www.ontotext.com/connectors/lucene#>
PREFIX luc-index: <http://www.ontotext.com/connectors/lucene/instance#>
PREFIX schema: <http://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ado: <http://kg.artsdata.ca/ontology/>

SELECT DISTINCT
 ?entity 
 ?score 
 ?name_en
 ?name_fr
 ?name
?type
?type_label
?disambiguatingDescription
?disambiguatingDescription_en
?disambiguatingDescription_fr
WHERE
{
    values ?query { "QUERY_PLACE_HOLDER"  }
    values ?type { TYPE_PLACE_HOLDER }

    ?search a luc-index:INDEX_PLACE_HOLDER ;
      luc:query ?query ;
      luc:entities ?entity .
    FILTER (CONTAINS(STR(?entity),"kg.artsdata.ca/resource/")) 
 
    ?entity luc:score ?score.
    
#NAME
  OPTIONAL { ?entity rdfs:label ?name_en. FILTER( LANG(?name_en) = "en")  }
  OPTIONAL {  ?entity rdfs:label ?name_fr.  FILTER( LANG(?name_fr) = "fr")}
  OPTIONAL {  ?entity rdfs:label ?name. FILTER ( LANG(?name) = "")}

#TYPE
 OPTIONAL { ?type rdfs:label ?type_label_raw filter(lang(?type_label_raw) = "") } 
 OPTIONAL { ?type rdfs:label ?type_label_en filter(lang(?type_label_en) = "en") } 
      BIND(COALESCE(?type_label_en, ?type_label_raw, "") as ?type_label)

# DISAMBIGUATING DESCRIPTION
 OPTIONAL { ?entity schema:disambiguatingDescription ?disambiguatingDescription_en. FILTER( LANG(?disambiguatingDescription_en) = "en")  }
 OPTIONAL {  ?entity schema:disambiguatingDescription ?disambiguatingDescription_fr.  FILTER( LANG(?disambiguatingDescription_fr) = "fr")}
 OPTIONAL {  ?entity schema:disambiguatingDescription ?disambiguatingDescription. FILTER ( LANG(?disambiguatingDescription) = "")}

} group by ?entity ?score ?name_en ?name_fr ?name ?type ?type_label ?disambiguatingDescription_en ?disambiguatingDescription_fr ?disambiguatingDescription
    `

};
