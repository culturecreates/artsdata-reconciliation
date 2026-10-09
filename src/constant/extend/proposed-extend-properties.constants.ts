import {RDF, RDFS, SCHEMA, SKOS} from "../shared";

export const PROPOSED_EXTEND_PROPERTIES_METADATA = {
    EVENT: {
        type: "Event",
        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: "name", name: "name"},
            {id: "startDate", name: "startDate"},
            {id: "endDate", name: "endDate"},
            {id: "disambiguatingDescription", name: "disambiguatingDescription"},
            {id: "additionalType", name: "additionalType"},
            {id: "url", name: "url"},
            {id: "sameAs", name: "sameAs"},
            {id: "eventStatus", name: "eventStatus"},
            {id: "eventAttendanceMode", name: "eventAttendanceMode"},
            {id: "location", name: "location"},
            {id: "offers", name: "offers"},
            {id: "performer", name: "performer"},
            {id: "organizer", name: "organizer"}
        ]
    },
    PLACE: {
        type: "Place",
        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: "name", name: "name"},
            {id: "url", name: "url"},
            {id: "sameAs", name: "sameAs"},
            {id: "disambiguatingDescription", name: "disambiguatingDescription"},
            {id: "address", name: "address"}
        ]
    },
    PERSON: {
        type: "Person",
        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: "name", name: "name"},
            {id: "url", name: "url"},
            {id: "sameAs", name: "sameAs"},
            {id: "disambiguatingDescription", name: "disambiguatingDescription"}
        ]
    },
    ORGANIZATION: {
        type: "Organization",
        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: "name", name: "name"},
            {id: "url", name: "url"},
            {id: "sameAs", name: "sameAs"},
            {id: "disambiguatingDescription", name: "disambiguatingDescription"}
        ]
    },
    AGENT: {
        type: "Agent",
        properties: [
            {id: RDF.TYPE, name: "type"},
            {id: "name", name: "name"},
            {id: "url", name: "url"},
            {id: "sameAs", name: "sameAs"},
            {id: "disambiguatingDescription", name: "disambiguatingDescription"}
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
            {id:SCHEMA.GENRE, name: "genre"},
            {id:SCHEMA.IN_LANGUAGE, name: "inLanguage"},
            {id:SCHEMA.CONTRIBUTOR, name: "contributor"},
            {id:SCHEMA.PRODUCER, name: "producer"},
            {id:SCHEMA.AUDIENCE, name: "audience"}

        ]
    }
};