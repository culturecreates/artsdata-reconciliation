export const ArtsdataProperties = {
    START_DATE: "schema:startDate",
    END_DATE: "schema:endDate",
    LOCATION: "schema:location",
    ORGANIZER: "schema:organizer",
    PERFORMER: "schema:performer",
    ADDITIONAL_TYPE: "schema:additionalType",
    MAIN_ENTITY_OF_PAGE: "schema:mainEntityOfPage",
    AUDIENCE: "schema:audience",
    EVENT_STATUS: "schema:eventStatus",
    IN_LANGUAGE: "schema:inLanguage",
    SUB_EVENT: "schema:subEvent",
    SAME_AS: "schema:sameAs",
};

export const ArtsdataConstants = {
    PREFIX: "http://kg.artsdata.ca/resource/",
    PREFIX_INCLUDING_K: "http://kg.artsdata.ca/resource/K",
};

export const Entities = {
    EVENT: "schema:Event",
    PLACE: "schema:Place",
    PERSON: "schema:Person",
    ORGANIZATION: "schema:Organization",
    CONCEPT: "skos:Concept",
    AGENT: "dbo:Agent",
    LIVE_PERFORMANCE_WORK: "dbo:LivePerformanceWork",
};

export const SCHEMA_ORG_PROPERTY_URI_MAP = {
    POSTAL_CODE: "<http://schema.org/postalCode>",
    ADDRESS_POSTAL_CODE: "<http://schema.org/address>/<http://schema.org/postalCode>",
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

