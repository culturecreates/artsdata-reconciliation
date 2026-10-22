export const EXPANDABLE_PROPERTIES = {
    ADDRESS: ["postalCode", "addressLocality", "addressCountry", "addressRegion"],
    LOCATION: ["name", "type", "description"],
    PERFORMER: ["name", "type", "disambiguatingDescription"],
    ORGANIZER: ["name", "type", "disambiguatingDescription"],
    OFFERS: ["url"]
};

/**
 * Properties used to read the literal value of a property that is not expandable
 * when it is requested with `settings.content = literal`.
 */
export const DEFAULT_LITERAL_PROPERTIES = ["name"];


/**
 * Properties (in the schema.org namespace) whose values are strings or language strings. They are read with
 * `adp:prefLangLiteral` so that only one literal, in the requested language, is returned per entity.
 */
export const LANGUAGE_LITERAL_PROPERTIES = ["name", "description", "disambiguatingDescription", "alternateName"];
