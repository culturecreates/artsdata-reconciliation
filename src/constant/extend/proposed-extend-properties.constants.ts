import {ADO, RDF, RDFS, SCHEMA, SKOS} from "../shared";

export const PROPOSED_EXTEND_PROPERTIES_METADATA = {
    EVENT: {
        type: "Event",
        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: SCHEMA.NAME, name: "name"},
            {id: SCHEMA.START_DATE, name: "startDate"},
            {id: SCHEMA.END_DATE, name: "endDate"},
            {id: SCHEMA.LOCATION, name: "location"},
            {id: SCHEMA.ADDITIONAL_TYPE, name: "additionalType"},
            {id: SCHEMA.URL, name: "url"},
            {id: SCHEMA.DESCRIPTION, name: "description"},
            {id: SCHEMA.IMAGE, name: "image"},
            {id: SCHEMA.ORGANIZER, name: "organizer"},
            {id: SCHEMA.PERFORMER, name: "performer"},
            {id: SCHEMA.WORKED_PERFORMED, name: "workedPerformed"},
            {id: SCHEMA.OFFERS, name: "offers"},
            {id: SCHEMA.SAME_AS, name: "sameAs"},
            {id: SCHEMA.IN_LANGUAGE, name: "inLanguage"},
            {id: SCHEMA.DURATION, name: "duration"},
            {id: SCHEMA.EVENT_ATTENDANCE_MODE, name: "eventAttendanceMode"},
            {id: SCHEMA.EVENT_STATUS, name: "eventStatus"},
            {id: SCHEMA.ALTERNATE_NAME, name: "alternateName"},
            {id: SCHEMA.MAIN_ENTITY_OF_PAGE, name: "mainEntityOfPage"},
            {id: SCHEMA.SUPER_EVENT, name: "superEvent"},
            {id: SCHEMA.SUB_EVENT, name: "subEvent"}
        ]
    },
    PLACE: {
        type: "Place",
        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: SCHEMA.NAME, name: "name"},
            {id: SCHEMA.ALTERNATE_NAME, name: "alternateName"},
            {id: SCHEMA.ADDRESS, name: "address"},
            {id: SCHEMA.ADDITIONAL_TYPE, name: "additionalType"},
            {id: SCHEMA.SAME_AS, name: "sameAs"},
            {id: SCHEMA.DISAMBIGUATING_DESCRIPTION, name: "disambiguatingDescription"},
            {id: SCHEMA.URL, name: "url"},
            {id: SCHEMA.CONTAINED_IN_PLACE, name: "containedInPlace"},
            {id: SCHEMA.CONTAINS_IN_PLACE, name: "containsInPlace"},
            {id: SCHEMA.GEO, name: "geo"},
            {id: SCHEMA.MAXIMUM_ATTENDEE_CAPACITY, name: "maximumAttendeeCapacity"},
            {id: ADO.OWNED_BY, name: "ownedBy"},
            {id: ADO.MANAGED_BY, name: "managedBy"},
            {id: ADO.USED_BY, name: "usedBy"},
            {id: ADO.HAS_RESIDENT, name: "hasResident"},
        ]
    },
    PERSON: {
        type: "Person",
        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: SCHEMA.NAME, name: "name"},
            {id: SCHEMA.ALTERNATE_NAME, name: "alternateName"},
            {id: SCHEMA.DESCRIPTION, name: "description"},
            {id: SCHEMA.SAME_AS, name: "sameAs"},
            {id: SCHEMA.URL, name: "url"},
            {id: SCHEMA.IMAGE, name: "image"},
            {id: SCHEMA.IDENTIFIER, name: "identifier"},
            {id: SCHEMA.ADDITIONAL_TYPE, name: "additionalType"},
            {id: SCHEMA.DISAMBIGUATING_DESCRIPTION, name: "disambiguatingDescription"},
            {id: SCHEMA.MAIN_ENTITY_OF_PAGE, name: "mainEntityOfPage"},
            {id: SCHEMA.ADDRESS, name: "address"},
            {id: SCHEMA.HAS_OCCUPATION, name: "hasOccupation"},
        ]
    },
    ORGANIZATION: {
        type: "Organization",
        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: SCHEMA.NAME, name: "name"},
            {id: SCHEMA.ALTERNATE_NAME, name: "alternateName"},
            {id: SCHEMA.DESCRIPTION, name: "description"},
            {id: SCHEMA.SAME_AS, name: "sameAs"},
            {id: SCHEMA.URL, name: "url"},
            {id: SCHEMA.IMAGE, name: "image"},
            {id: SCHEMA.IDENTIFIER, name: "identifier"},
            {id: SCHEMA.ADDITIONAL_TYPE, name: "additionalType"},
            {id: SCHEMA.DISAMBIGUATING_DESCRIPTION, name: "disambiguatingDescription"},
            {id: SCHEMA.MAIN_ENTITY_OF_PAGE, name: "mainEntityOfPage"},
            {id: SCHEMA.ADDRESS, name: "address"},
            {id: SCHEMA.LOCATION, name: "location"}
        ]
    },
    AGENT: {
        type: "Agent",
        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: SCHEMA.NAME, name: "name"},
            {id: SCHEMA.ALTERNATE_NAME, name: "alternateName"},
            {id: SCHEMA.DESCRIPTION, name: "description"},
            {id: SCHEMA.SAME_AS, name: "sameAs"},
            {id: SCHEMA.URL, name: "url"},
            {id: SCHEMA.IMAGE, name: "image"},
            {id: SCHEMA.IDENTIFIER, name: "identifier"},
            {id: SCHEMA.ADDITIONAL_TYPE, name: "additionalType"},
            {id: SCHEMA.DISAMBIGUATING_DESCRIPTION, name: "disambiguatingDescription"},
            {id: SCHEMA.MAIN_ENTITY_OF_PAGE, name: "mainEntityOfPage"},
            {id: SCHEMA.ADDRESS, name: "address"},
            {id: SCHEMA.HAS_OCCUPATION, name: "hasOccupation"},
        ]
    },
    CONCEPT: {
        type: "Concept",
        properties: [
            {id: RDF.TYPE, name: "type"},

            {id: RDFS.LABEL, name: "label"},
            {id: RDFS.COMMENT, name: "comment"},

            {id: SKOS.PREF_LABEL, name: "prefLabel"},
            {id: SKOS.ALT_LABEL, name: "altLabel"},
            {id: SKOS.IN_SCHEME, name: "inScheme"},
            {id: SKOS.DEFINITION, name: "definition"},
            {id: SKOS.BROADER, name: "broader"},
            {id: SKOS.NARROWER, name: "narrower"},
            {id: SKOS.NARROW_MATCH, name: "narrowMatch"},
            {id: SKOS.RELATED, name: "related"},
            {id: SKOS.CLOSE_MATCH, name: "closeMatch"},
            {id: SKOS.EXACT_MATCH, name: "exactMatch"},
            {id: SKOS.RELATED_MATCH, name: "relatedMatch"},
        ]
    },
    LIVE_PERFORMANCE_WORK: {
        type: "LivePerformanceWork",

        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: SCHEMA.NAME, name: "name"},
            {id: SCHEMA.ADDITIONAL_TYPE, name: "additionalType"},
            {id: SCHEMA.SAME_AS, name: "sameAs"},
            {id: SCHEMA.URL, name: "url"},
            {id: SCHEMA.MAIN_ENTITY_OF_PAGE, name: "mainEntityOfPage"},
            {id: SCHEMA.IMAGE, name: "image"},
            {id: SCHEMA.DESCRIPTION, name: "description"},
            {id: SCHEMA.GENRE, name: "genre"},
            {id: SCHEMA.IN_LANGUAGE, name: "inLanguage"},
            {id: SCHEMA.CONTRIBUTOR, name: "contributor"},
            {id: SCHEMA.PRODUCER, name: "producer"},
            {id: SCHEMA.AUDIENCE, name: "audience"}

        ]
    }
};