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
    PREFIX_ADR: "http://kg.artsdata.ca/resource/",
    PREFIX_ADO: "http://kg.artsdata.ca/ontology/",
    PREFIX_INCLUDING_K: "http://kg.artsdata.ca/resource/K",
};

export const PREFIXES = {
    SCHEMA: "http://schema.org/",
    RDF: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    RDFS: "http://www.w3.org/2000/01/rdf-schema#",
    SKOS: "http://www.w3.org/2004/02/skos/core#",
    DBO: "http://dbpedia.org/ontology/",
    ADO: "http://kg.artsdata.ca/ontology/"
};

export const RDF = {
    TYPE: `${PREFIXES.RDF}type`,
};

export const SCHEMA = {
    NAME: `${PREFIXES.SCHEMA}name`,
    ALTERNATE_NAME: `${PREFIXES.SCHEMA}alternateName`,
    URL: `${PREFIXES.SCHEMA}url`,
    SAME_AS: `${PREFIXES.SCHEMA}sameAs`,
    IMAGE: `${PREFIXES.SCHEMA}image`,
    DESCRIPTION: `${PREFIXES.SCHEMA}description`,
    DISAMBIGUATING_DESCRIPTION: `${PREFIXES.SCHEMA}disambiguatingDescription`,
    ADDRESS: `${PREFIXES.SCHEMA}address`,
    POSTAL_CODE: `${PREFIXES.SCHEMA}postalCode`,
    ADDRESS_LOCALITY: `${PREFIXES.SCHEMA}addressLocality`,
    ADDRESS_COUNTRY: `${PREFIXES.SCHEMA}addressCountry`,
    ADDRESS_REGION: `${PREFIXES.SCHEMA}addressRegion`,
    START_DATE: `${PREFIXES.SCHEMA}startDate`,
    END_DATE: `${PREFIXES.SCHEMA}endDate`,
    LOCATION: `${PREFIXES.SCHEMA}location`,
    ORGANIZER: `${PREFIXES.SCHEMA}organizer`,
    PERFORMER: `${PREFIXES.SCHEMA}performer`,
    ADDITIONAL_TYPE: `${PREFIXES.SCHEMA}additionalType`,
    MAIN_ENTITY_OF_PAGE: `${PREFIXES.SCHEMA}mainEntityOfPage`,
    AUDIENCE: `${PREFIXES.SCHEMA}audience`,
    EVENT_STATUS: `${PREFIXES.SCHEMA}eventStatus`,
    IN_LANGUAGE: `${PREFIXES.SCHEMA}inLanguage`,
    SUB_EVENT: `${PREFIXES.SCHEMA}subEvent`,
    OFFERS: `${PREFIXES.SCHEMA}offers`,
    GENRE: `${PREFIXES.SCHEMA}genre`,
    CONTRIBUTOR: `${PREFIXES.SCHEMA}contributor`,
    PRODUCER: `${PREFIXES.SCHEMA}producer`,
    IDENTIFIER: `${PREFIXES.SCHEMA}identifier`,
    HAS_OCCUPATION: `${PREFIXES.SCHEMA}hasOccupation`,
    CONTAINED_IN_PLACE: `${PREFIXES.SCHEMA}containedInPlace`,
    CONTAINS_IN_PLACE: `${PREFIXES.SCHEMA}containsInPlace`,
    GEO: `${PREFIXES.SCHEMA}geo`,
    MAXIMUM_ATTENDEE_CAPACITY: `${PREFIXES.SCHEMA}maximumAttendeeCapacity`,
};

export const RDFS = {
    LABEL: `${PREFIXES.RDFS}label`,
    COMMENT: `${PREFIXES.RDFS}comment`,

};

export const ADO = {
    MANAGED_BY: `${PREFIXES.ADO}managedBy`,
    OWNED_BY: `${PREFIXES.ADO}ownedBy`,
    USED_BY: `${PREFIXES.ADO}usedBy`,
    HAS_RESIDENT: `${PREFIXES.ADO}hasResident`,
};

export const SKOS = {
    PREF_LABEL: `${PREFIXES.SKOS}prefLabel`,
    ALT_LABEL: `${PREFIXES.SKOS}altLabel`,
    BROADER: `${PREFIXES.SKOS}broader`,
    NARROWER: `${PREFIXES.SKOS}narrower`,
    RELATED: `${PREFIXES.SKOS}related`,
    CLOSE_MATCH: `${PREFIXES.SKOS}closeMatch`,
    EXACT_MATCH: `${PREFIXES.SKOS}exactMatch`,
    NARROW_MATCH: `${PREFIXES.SKOS}narrowMatch`,
    RELATED_MATCH: `${PREFIXES.SKOS}relatedMatch`,
    DEFINITION: `${PREFIXES.SKOS}definition`,
    IN_SCHEME: `${PREFIXES.SKOS}inScheme`,
};

export const Entities = {
    EVENT: "http://schema.org/Event",
    ADO_EVENT: "http://kg.artsdata.ca/ontology/Event",
    PLACE: "http://schema.org/Place",
    ADO_PLACE: "http://kg.artsdata.ca/ontology/Place",
    PERSON: "http://schema.org/Person",
    ADO_PERSON: "http://kg.artsdata.ca/ontology/Person",
    ORGANIZATION: "http://schema.org/Organization",
    ADO_ORGANIZATION: "http://kg.artsdata.ca/ontology/Organization",
    CONCEPT: "http://www.w3.org/2004/02/skos/core#Concept",
    AGENT: "http://dbpedia.org/ontology/Agent",
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
    SUB_EVENT: "<http://schema.org/subEvent>",
    END_DATE: "<http://schema.org/endDate>",
    LOCATION: "<http://schema.org/location>",
    LOCATION_NAME: "<http://schema.org/location>/<http://schema.org/name>",
    LOCATIONS_URI: "<http://schema.org/location>/<http://schema.org/sameAs>",

};

