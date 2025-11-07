export interface MatchQualifier {
    id: string;
    name: string;
}

export interface SuggestPropertyResult extends SuggestResult{
    matchQualifiers: MatchQualifier[];
}

export interface SuggestResult {
    id: string;
    name: string;
    type: string;
}

export interface SuggestResponse {
    result: SuggestResult[]
}

export interface SuggestPropertyResponse {
    result: SuggestPropertyResult[]
}

