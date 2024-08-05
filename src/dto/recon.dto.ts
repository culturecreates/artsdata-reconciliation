import { ApiProperty } from "@nestjs/swagger";
import { MatchQualifierEnum, MatchQuantifierEnum } from "../enum";

class ReconciliationType {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
}

export class MultilingualValues {
  @ApiProperty()
  str: string;
  @ApiProperty()
  lang?: string;
}

export class MultilingualString {
  @ApiProperty({ type: [MultilingualValues] })
  values: MultilingualValues[];
}

export class ResultCandidates {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: MultilingualString | string;
  @ApiProperty()
  description: MultilingualString | string;
  @ApiProperty()
  score: number;
  @ApiProperty()
  match: boolean;
  @ApiProperty({ type: [ReconciliationType] })
  type: ReconciliationType[];
}

export class ReconciliationResults {
  @ApiProperty()
  candidates: ResultCandidates[];
}

export class ReconciliationResponse {
  @ApiProperty({ type: ReconciliationResults })
  results: ReconciliationResults[];
}


export class QueryCondition {
  @ApiProperty()
  matchType: string;
  @ApiProperty()
  v: string;
  @ApiProperty()
  pid?: string;
  @ApiProperty()
  required?: boolean;
}

class ReconciliationQuery {
  @ApiProperty()
  type: string;
  @ApiProperty()
  limit?: number;
  @ApiProperty({ type: [QueryCondition] })
  conditions: QueryCondition[];
}

export class ReconciliationRequest {
  @ApiProperty({ type: [ReconciliationQuery] })
  queries: ReconciliationQuery[];
}