export const PREVIEW_QUERY = `
 PREFIX schema: <http://schema.org/>
 SELECT ?name (GROUP_CONCAT(?type_label; SEPARATOR=", ") AS ?typeLabels) ?description ?image WHERE {   
 
 VALUES (?entity) { (<URI_PLACE_HOLDER>) } 
  
 #NAME
  OPTIONAL { ?entity schema:name ?name_en. FILTER( LANG(?name_en) = "en")  }
  OPTIONAL {  ?entity schema:name ?name_fr.  FILTER( LANG(?name_fr) = "fr")}
  OPTIONAL {  ?entity schema:name ?name_no. FILTER ( LANG(?name_no) = "")}
  BIND(COALESCE(?name_en, ?description_fr, ?name_fr,?name_no ) as ?name)
  
 #TYPE
   ?entity    a ?type_additional.
   OPTIONAL { ?type_additional rdfs:label ?type_label_raw filter(lang(?type_label_raw) = "") }
   OPTIONAL { ?type_additional rdfs:label ?type_label_en filter(lang(?type_label_en) = "en") }
   BIND(COALESCE(?type_label_en, ?type_label_raw, "") as ?type_label)

#DISAMBIGUATING DESCRIPTION
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_en. FILTER( LANG(?description_en) = "en")  }
   OPTIONAL {  ?entity schema:disambiguatingDescription ?description_fr.  FILTER( LANG(?description_fr) = "fr")}
   OPTIONAL {  ?entity schema:disambiguatingDescription ?description_no. FILTER ( LANG(?description_no) = "")}
   BIND(COALESCE(?description_en, ?description_fr, ?description_no, "") as ?description)
   
#IMAGE
      OPTIONAL {?entity schema:image ?imageURL}
      OPTIONAL {?entity schema:image/schema:url ?imageURLFromObject}
         BIND(COALESCE(?imageURLFromObject, ?imageURL) as ?image)

    }GROUP BY ?name ?description ?image`
;