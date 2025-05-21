export const EXTEND_QUERY = `
 PREFIX schema: <http://schema.org/>
 SELECT * WHERE {   
    VALUES (?uri) {
    <URI_PLACE_HOLDER>}  
      <TRIPLES_PLACE_HOLDER>
    }`
;