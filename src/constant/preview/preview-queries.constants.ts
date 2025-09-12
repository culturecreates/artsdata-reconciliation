export const PREVIEW_QUERY = `
 PREFIX schema: <http://schema.org/>
 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
 SELECT ?name (GROUP_CONCAT(?type_label; SEPARATOR=", ") AS ?typeLabels) ?description ?image WHERE {
   VALUES (?entity) { (<URI_PLACE_HOLDER>) }
 
   # NAME
   OPTIONAL { ?entity schema:name ?name_en. FILTER(LANG(?name_en) = "en") }
   OPTIONAL { ?entity schema:name ?name_fr. FILTER(LANG(?name_fr) = "fr") }
   OPTIONAL { ?entity schema:name ?name_no. FILTER(LANG(?name_no) = "") }
   BIND(COALESCE(?name_en, ?description_fr, ?name_fr, ?name_no) AS ?name)
 
   # TYPE
   ?entity a ?type_additional.
   OPTIONAL { ?type_additional rdfs:label ?type_label_raw. FILTER(LANG(?type_label_raw) = "") }
   OPTIONAL { ?type_additional rdfs:label ?type_label_en. FILTER(LANG(?type_label_en) = "en") }
   BIND(COALESCE(?type_label_en, ?type_label_raw) AS ?type_label)
 
   # DISAMBIGUATING DESCRIPTION
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_en. FILTER(LANG(?description_en) = "en") }
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_fr. FILTER(LANG(?description_fr) = "fr") }
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_no. FILTER(LANG(?description_no) = "") }
   BIND(COALESCE(?description_en, ?description_fr, ?description_no) AS ?description)
 
   # IMAGE
   OPTIONAL { ?entity schema:image ?imageURL }
   OPTIONAL { ?entity schema:image/schema:url ?imageURLFromObject }
   BIND(COALESCE(?imageURLFromObject, ?imageURL) AS ?image)
 }
 GROUP BY ?name ?description ?image
 `;