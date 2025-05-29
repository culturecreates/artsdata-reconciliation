export const QUERIES = {

  RECONCILIATION_QUERY: `

PREFIX luc: <http://www.ontotext.com/connectors/lucene#>
PREFIX luc-index: <http://www.ontotext.com/connectors/lucene/instance#>
PREFIX schema: <http://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ado: <http://kg.artsdata.ca/ontology/>
PREFIX onto: <http://www.ontotext.com/>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT
   ?entity
   ?score
   (SAMPLE(?name_en) as ?nameEn)
   (SAMPLE(?name_fr) as ?nameFr)
   (SAMPLE(?name_no) as ?name)
   (SAMPLE(?description_no) as ?description)
   (SAMPLE(?description_en) as ?descriptionEn)
   (SAMPLE(?description_fr) as ?descriptionFr)
   ?type_label
WHERE
{
  QUERY_PLACE_HOLDER
  TYPE_PLACE_HOLDER
    
  ?search a luc-index:INDEX_PLACE_HOLDER ;
  QUERY_FILTER_PLACE_HOLDER
  luc:entities ?entity .
  PROPERTY_PLACE_HOLDER
   
  FILTER (CONTAINS(STR(?entity),"kg.artsdata.ca/resource/")) 
 
  ?entity luc:score ?score;
    
#NAME
  OPTIONAL { ?entity schema:name ?name_en. FILTER( LANG(?name_en) = "en")  }
  OPTIONAL {  ?entity schema:name ?name_fr.  FILTER( LANG(?name_fr) = "fr")}
  OPTIONAL {  ?entity schema:name ?name_no. FILTER ( LANG(?name_no) = "")}

#TYPE
   ?entity    a ?type_additional.
   OPTIONAL { ?type_additional rdfs:label ?type_label_raw filter(lang(?type_label_raw) = "") }
   OPTIONAL { ?type_additional rdfs:label ?type_label_en filter(lang(?type_label_en) = "en") }
   BIND(COALESCE(?type_label_en, ?type_label_raw, "") as ?type_label)

#DISAMBIGUATING DESCRIPTION
   OPTIONAL { ?entity schema:disambiguatingDescription ?description_en. FILTER( LANG(?description_en) = "en")  }
   OPTIONAL {  ?entity schema:disambiguatingDescription ?description_fr.  FILTER( LANG(?description_fr) = "fr")}
   OPTIONAL {  ?entity schema:disambiguatingDescription ?description_no. FILTER ( LANG(?description_no) = "")}

} group by ?entity ?score ?type ?type_label
LIMIT_PLACE_HOLDER
`,

  RECONCILIATION_QUERY_BY_URI: `

PREFIX schema: <http://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ado: <http://kg.artsdata.ca/ontology/>
PREFIX onto: <http://www.ontotext.com/>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT
   ?entity
   ?score
   (SAMPLE(?name_en) as ?nameEn)
   (SAMPLE(?name_fr) as ?nameFr)
   (SAMPLE(?name_no) as ?name)
   (SAMPLE(?description_no) as ?description)
   (SAMPLE(?description_en) as ?descriptionEn)
   (SAMPLE(?description_fr) as ?descriptionFr)
    ?type_label
WHERE
{
    BIND(URI_PLACEHOLDER as ?entity)
  #NAME
  OPTIONAL { ?entity schema:name ?name_en. FILTER( LANG(?name_en) = "en")  }
  OPTIONAL {  ?entity schema:name ?name_fr.  FILTER( LANG(?name_fr) = "fr")}
  OPTIONAL {  ?entity schema:name ?name_no. FILTER ( LANG(?name_no) = "")}
  
 #TYPE
 ?entity    a ?type_additional.
 OPTIONAL { ?type_additional rdfs:label ?type_label_raw filter(lang(?type_label_raw) = "") }
 OPTIONAL { ?type_additional rdfs:label ?type_label_en filter(lang(?type_label_en) = "en") }
 BIND(COALESCE(?type_label_en, ?type_label_raw, "") as ?type_label)

 #DISAMBIGUATING DESCRIPTION
 OPTIONAL { ?entity schema:disambiguatingDescription ?description_en. FILTER( LANG(?description_en) = "en")  }
 OPTIONAL {  ?entity schema:disambiguatingDescription ?description_fr.  FILTER( LANG(?description_fr) = "fr")}
 OPTIONAL {  ?entity schema:disambiguatingDescription ?description_no. FILTER ( LANG(?description_no) = "")}
} group by ?entity ?score ?type ?type_label
LIMIT_PLACE_HOLDER
`
};
