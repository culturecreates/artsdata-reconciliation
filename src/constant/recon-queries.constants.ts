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
 ?name
 ?disambiguatingDescription
 ?type 
 ?typeLabel
WHERE
{
    values ?query { "QUERY_PLACE_HOLDER"  }
    values ?type { TYPE_PLACE_HOLDER }

    ?search a luc-index:place-index ;
      luc:query ?query ;
      luc:entities ?entity .
    FILTER (CONTAINS(STR(?entity),"kg.artsdata.ca/resource/")) 
 
    ?entity luc:score ?score.
    
#NAME
    OPTIONAL { 
		?entity rdfs:label ?name_in_english. 
		FILTER( LANG(?name_in_english) = "en") 
	}
	OPTIONAL { 
		?entity rdfs:label ?name_in_french. 
		FILTER( LANG(?name_in_french) = "fr")
	}
	OPTIONAL { 
		?entity rdfs:label ?name_without_language. 
		FILTER ( LANG(?name_without_language) = "")
	}
	BIND (COALESCE(?name_in_english,?name_in_french, ?name_without_language) as ?name)
    
# DISAMBIGUATING DESCRIPTION
    
	OPTIONAL {
        ?entity schema:disambiguatingDescription ?disambiguatingDescription_same_language .
        FILTER (LANG(?name) = LANG(?disambiguatingDescription_same_language))
    }

    OPTIONAL {
        ?entity schema:disambiguatingDescription ?disambiguatingDescription_another_language .
        FILTER (LANG(?name) != LANG(?disambiguatingDescription_another_language))
    } 
    BIND (COALESCE(?disambiguatingDescription_same_language,?disambiguatingDescription_another_language) as ?disambiguatingDescription)

#TYPE

    OPTIONAL {
        ?type rdfs:label ?type_label_raw filter(lang(?type_label_raw) = "") 
    } 
	OPTIONAL {
        ?type rdfs:label ?type_label_en filter(lang(?type_label_en) = "en") 
    } 
	BIND(COALESCE(?type_label_en, ?type_label_raw, "") as ?type_label) 

} GROUP BY ?entity ?score ?name ?type ?typeLabel ?disambiguatingDescription  
  `

};
