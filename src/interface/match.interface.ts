export interface RecordFromQuery {
    name: string | undefined;
    postalCode: string | undefined;
    addressLocality: string | undefined;
    addressRegion: string | undefined;
    url: string | undefined;
    startDate: string | undefined;
    endDate: string | undefined;
    subEvents?:string[]|undefined;
    locationName: string | undefined;
    locationUri: string | undefined;
    isni: string | undefined;
    wikidata: string | undefined;
    locationContains: string | undefined;
    locationContainedIn: string | undefined;
}

