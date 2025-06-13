export const SUGGEST_QUERY = {
    ENTITY: `PREFIX luc: <http://www.ontotext.com/connectors/lucene#>
PREFIX luc-index: <http://www.ontotext.com/connectors/lucene/instance#>
PREFIX schema: <http://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ado: <http://kg.artsdata.ca/ontology/>
PREFIX onto: <http://www.ontotext.com/>
PREFIX dbo: <http://dbpedia.org/ontology/>

SELECT DISTINCT
   ?entity
   ?name
   ?description
   ?image
    ?typeLabel
WHERE
{
  
  {SELECT ?entity WHERE {
  values ?query { "QUERY_PLACE_HOLDER"  }
    
    ?search a luc-index:INDEX_PLACE_HOLDER;
            luc:query ?query ;
            luc:entities ?entity .
  
  FILTER_BY_ENTITY_PLACEHOLDER
  }LIMIT 10}
 
#NAME
  OPTIONAL { ?entity schema:name|rdfs:label ?name_en. FILTER( LANG(?name_en) = "en")  }
  OPTIONAL {  ?entity schema:name|rdfs:label ?name_fr.  FILTER( LANG(?name_fr) = "fr")}
  OPTIONAL {  ?entity schema:name|rdfs:label ?name_no. FILTER ( LANG(?name_no) = "")}
  
   BIND(COALESCE(?name_en, ?name_fr, ?name_no) as ?name)

#DISAMBIGUATING DESCRIPTION
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_en. FILTER( LANG(?description_en) = "en")  }
   OPTIONAL {  ?entity schema:disambiguatingDescription ?description_fr.  FILTER( LANG(?description_fr) = "fr")}
   OPTIONAL {  ?entity schema:disambiguatingDescription ?description_no. FILTER ( LANG(?description_no) = "")}
      BIND(COALESCE(?description_en, ?description_fr, ?description_no) as ?description)
   
#TYPE
   ?entity a ?type_additional.
   OPTIONAL { ?type_additional rdfs:label ?type_label_raw filter(lang(?type_label_raw) = "")}
   OPTIONAL { ?type_additional rdfs:label ?type_label_en filter(lang(?type_label_en) = "en")}
   BIND(COALESCE(?type_label_en, ?type_label_raw, "") as ?typeLabel)

#IMAGE
      OPTIONAL {?entity schema:image ?imageURL}
      OPTIONAL {?entity schema:image/schema:url ?imageURLFromObject}
         BIND(COALESCE(?imageURLFromObject, ?imageURL) as ?image)

}  group by ?entity ?name ?description ?image ?typeLabel`
  }

;