export enum ReconciliationTypesEnum {
  EVENT = "schema:Event" ,
  PLACE = "schema:Place" ,
  PERSON = "schema:Person" ,
  ORGANIZATION = "schema:Organization"
}

export enum MatchRequestLanguageEnum {
  ENGLISH = "en" ,
  FRENCH = "fr"
}

export enum MatchTypeEnum {
  NAME = "name" ,
  PROPERTY = "property"
}


export enum MatchQuantifierEnum {
  ANY = "any" ,
  ALL = "all" ,
  NONE = "none"
}

export enum MatchQualifierEnum {
  REGEX_MATCH = "RegexMatch" ,
  EXACT_MATCH = "ExactMatch"

}