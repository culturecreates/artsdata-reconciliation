export const ArtsdataProperties = {
    START_DATE: "http://schema.org/startDate",
    END_DATE: "http://schema.org/endDate",
    LOCATION: "http://schema.org/location",
    ORGANIZER: "http://schema.org/organizer",
    PERFORMER: "http://schema.org/performer",
    ADDITIONAL_TYPE: "http://schema.org/additionalType",
    MAIN_ENTITY_OF_PAGE: "http://schema.org/mainEntityOfPage",
    AUDIENCE: "http://schema.org/audience",
    EVENT_STATUS: "http://schema.org/eventStatus",
    IN_LANGUAGE: "http://schema.org/inLanguage",
    SUB_EVENT: "http://schema.org/subEvent",
    SAME_AS: "http://schema.org/sameAs",
};

export const ArtsdataConstants = {
    PREFIX: "http://kg.artsdata.ca/resource/",
    PREFIX_INCLUDING_K: "http://kg.artsdata.ca/resource/K",
};

export const PREFIXES = {
    SCHEMA: "http://schema.org/",
    SKOS: "http://www.w3.org/2004/02/skos/core#",
    ADO: "http://kg.artsdata.ca/ontology/"
};

export const Entities = {
    EVENT: "http://schema.org/Event",
    PLACE: "http://schema.org/Place",
    PERSON: "http://schema.org/Person",
    ORGANIZATION: "http://schema.org/Organization",
    CONCEPT: "http://www.w3.org/2004/02/skos/core#Concept",
    AGENT: "http://kg.artsdata.ca/ontology/Agent",
    LIVE_PERFORMANCE_WORK: "http://kg.artsdata.ca/ontology/LivePerformanceWork",
    EVENT_TYPE: "http://kg.artsdata.ca/ontology/EventType"
};

export const SCHEMA_ORG_PROPERTY_URI_MAP = {
    POSTAL_CODE: "<http://schema.org/postalCode>",
    ADDRESS_POSTAL_CODE: "<http://schema.org/address>/<http://schema.org/postalCode>",
    LOCATION_ADDRESS_POSTAL_CODE: "<http://schema.org/location>/<http://schema.org/address>/<http://schema.org/postalCode>",
    ADDRESS_LOCALITY: "<http://schema.org/addressLocality>",
    ADDRESS_ADDRESS_LOCALITY: "<http://schema.org/address>/<http://schema.org/addressLocality>",
    ADDRESS_COUNTRY: "<http://schema.org/addressCountry>",
    ADDRESS_ADDRESS_COUNTRY: "<http://schema.org/address>/<http://schema.org/addressCountry>",
    ADDRESS_REGION: "<http://schema.org/addressRegion>",
    ADDRESS_ADDRESS_REGION: "<http://schema.org/address>/<http://schema.org/addressRegion>",
    NAME: "<http://schema.org/name>",
    URL: "<http://schema.org/url>",
    SAME_AS: "<http://schema.org/sameAs>",
    START_DATE: "<http://schema.org/startDate>",
    END_DATE: "<http://schema.org/endDate>",
    LOCATION: "<http://schema.org/location>",
    LOCATION_NAME:"<http://schema.org/location>/<http://schema.org/name>",
    LOCATIONS_URI: "<http://schema.org/location>/<http://schema.org/sameAs>",

};

