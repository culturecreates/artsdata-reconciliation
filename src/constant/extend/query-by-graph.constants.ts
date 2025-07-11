export const QUERY_BY_GRAPH = {
  EVENT: `PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>
SELECT 
  ?uri 
  (sample(?name_language) as ?name)  
  (sample(?location_name) as ?location) 
  (sample(?additionalType) as ?type)  
  ?startDate 
  ?endDate 
WHERE {
    ?uri a schema:TYPE_PLACEHOLDER .
    graph <GRAPH_URI_PLACEHOLDER> {
        ?uri schema:name  ?name_language ;
              a ?additionalType ;
              schema:startDate ?startDate . 
        OPTIONAL {  ?uri schema:endDate ?endDate . 
        BIND(IF(datatype(?endDate) = xsd:date, xsd:dateTime(CONCAT(STR(?endDate), "T00:00:00")), ?endDate) AS ?normalizedEndDate)
        }
        BIND(IF(datatype(?startDate) = xsd:date, xsd:dateTime(CONCAT(STR(?startDate), "T00:00:00")), ?startDate) AS ?normalizedStartDate)
        OPTIONAL {
          FILTER NOT EXISTS { ?series schema:subEvent ?uri . }
          bind(COALESCE(?normalizedEndDate,?normalizedStartDate) as ?earliest_end)
          filter(?earliest_end > now())
        }
         OPTIONAL { ?uri a ?additionalType . }
    } 
    OPTIONAL {
      ?adid_sub schema:sameAs ?uri .
      filter(contains(str(?adid_sub),"http://kg.artsdata.ca/resource/K"))
    }
    OPTIONAL {
      ?uri schema:sameAs ?adid_obj .
      filter(contains(str(?adid_obj),"http://kg.artsdata.ca/resource/K"))
    }
    bind(COALESCE(?adid_obj, ?adid_sub) as ?adid)
    OPTIONAL {?uri schema:location/schema:name ?location_name .}
} GROUP BY ?uri ?normalizedStartDate ?startDate ?endDate 
ORDER BY DESC(?normalizedStartDate) 
LIMIT LIMIT_PLACEHOLDER
OFFSET OFFSET_PLACEHOLDER` ,


  ORGANIZATION: `PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
SELECT ?uri 
(sample(?name_language) as ?name)  
(sample(?adid) as ?sameAs)
WHERE {
    graph <GRAPH_URI_PLACEHOLDER> {
        ?uri  a ?type  .
        ?uri  schema:name  ?name_language.
    }
    ?uri a schema:TYPE_PLACEHOLDER.      
    OPTIONAL {
      ?adid_sub schema:sameAs ?uri .
      filter(contains(str(?adid_sub),"http://kg.artsdata.ca/resource/K"))
    }
    OPTIONAL {
      ?uri schema:sameAs ?adid_obj .
      filter(contains(str(?adid_obj),"http://kg.artsdata.ca/resource/K"))
    }
    bind(COALESCE(?adid_obj, ?adid_sub) as ?adid)
} GROUP BY ?uri 
ORDER BY ?uri
LIMIT LIMIT_PLACEHOLDER
OFFSET OFFSET_PLACEHOLDER`  ,

  PERSON: `PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
SELECT distinct ?uri 
(sample(?name_language) as ?name)  
(sample(?adid) as ?sameAs) 
(sample(?resultSeverity) as ?conforms)
WHERE {
    graph <GRAPH_URI_PLACEHOLDER> {
        ?uri  a ?type  . 
        OPTIONAL { ?uri schema:name  ?name_language ; }
    }
    ?uri a schema:TYPE_PLACEHOLDER .      
    OPTIONAL {
      ?adid_sub schema:sameAs ?uri .
      filter(contains(str(?adid_sub),"http://kg.artsdata.ca/resource/K"))
    }
    OPTIONAL {
      ?uri schema:sameAs ?adid_obj .
      filter(contains(str(?adid_obj),"http://kg.artsdata.ca/resource/K"))
    }
    bind(COALESCE(?adid_obj, ?adid_sub) as ?adid)
} GROUP BY ?uri 
ORDER BY ?uri
LIMIT LIMIT_PLACEHOLDER
OFFSET OFFSET_PLACEHOLDER` ,

  PLACE: `PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
SELECT ?uri 
(sample(?name_language) as ?name) 
(sample(?addressLocality) as ?locality) 
(sample(?addressRegion) as ?region) 
(sample(?adid) as ?sameAs) 
WHERE {
    graph <GRAPH_URI_PLACEHOLDER> {
       ?uri a ?type  . 
        OPTIONAL { ?uri schema:name ?name_language. }
    }
    ?uri a schema:TYPE_PLACEHOLDER .      
    #filter(!isBLANK(?uri))  
    OPTIONAL {
      ?adid_sub schema:sameAs ?uri .
      filter(contains(str(?adid_sub),"http://kg.artsdata.ca/resource/K"))
    }
    OPTIONAL {
      ?uri schema:sameAs ?adid_obj .
      filter(contains(str(?adid_obj),"http://kg.artsdata.ca/resource/K"))
    }
    bind(COALESCE(?adid_obj, ?adid_sub) as ?adid)
    OPTIONAL { ?uri schema:address/schema:addressLocality  ?addressLocality. }
    OPTIONAL { uri schema:address/schema:addressRegion ?addressRegion.}
} GROUP BY ?uri  
ORDER BY ?uri
LIMIT LIMIT_PLACEHOLDER
OFFSET OFFSET_PLACEHOLDER` ,
};