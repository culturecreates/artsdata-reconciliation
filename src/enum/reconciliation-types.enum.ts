export enum ReconciliationTypesEnum {
  EVENT = "schema:Event",
  PLACE = "schema:Place",
  PERSON = "schema:Person",
  ORGANIZATION = "schema:Organization"
}


export enum LanguageTagEnum {
  ENGLISH = "en",
  FRENCH = "fr"
}


export enum ReconRequestMatchTypeEnum {
  NAME = "name",
  PROPERTY = "property"
}

export enum MatchQuantifierEnum {
  // ANY = "any",
  ALL = "all",
  NONE = "none"
}

export enum MatchQualifierEnum {
  WILDCARD_MATCH = "WildcardMatch",

}