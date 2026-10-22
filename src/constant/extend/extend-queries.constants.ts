export const EXTEND_QUERY = `
      PREFIX schema: <http://schema.org/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX adp: <http://kg.artsdata.ca/plugin#>
      CONSTRUCT {
        <CONSTRUCT_PLACE_HOLDER>
      }
      FROM <http://www.ontotext.com/explicit>
      WHERE {
        VALUES (?uri) { <URI_PLACE_HOLDER> }
        <TRIPLES_PLACE_HOLDER>
      }`;