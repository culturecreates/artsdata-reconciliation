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
 (SAMPLE(?name_en) as ?nameEn)
 (SAMPLE(?name_fr) as ?nameFr)
 (SAMPLE(?name_no) as ?description)
?type
?type_label
(SAMPLE(?description_no) as ?description)
(SAMPLE(?description_en) as ?descriptionEn)
(SAMPLE(?description_fr) as ?descriptionFr)
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
  OPTIONAL {  ?entity rdfs:label ?name_no. FILTER ( LANG(?name_no) = "")}

#TYPE
 OPTIONAL { ?type rdfs:label ?type_label_raw filter(lang(?type_label_raw) = "") } 
 OPTIONAL { ?type rdfs:label ?type_label_en filter(lang(?type_label_en) = "en") } 
 BIND(COALESCE(?type_label_en, ?type_label_raw, "") as ?type_label)

# DISAMBIGUATING DESCRIPTION
 OPTIONAL { ?entity schema:disambiguatingDescription ?description_en. FILTER( LANG(?description_en) = "en")  }
 OPTIONAL {  ?entity schema:disambiguatingDescription ?description_fr.  FILTER( LANG(?description_fr) = "fr")}
 OPTIONAL {  ?entity schema:disambiguatingDescription ?description_no. FILTER ( LANG(?description_no) = "")}

} group by ?entity ?score ?name_en ?name_fr ?name ?type ?type_label ?description_en ?description_fr ?description
`
};
