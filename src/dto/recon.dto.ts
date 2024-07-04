import { ApiProperty } from "@nestjs/swagger";

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


class QueryCondition {
  @ApiProperty()
  matchType: string;
  @ApiProperty()
  v: string;
}

class ReconciliationQuery {
  @ApiProperty()
  type: string;
  @ApiProperty()
  limit: number;
  @ApiProperty({ type: [QueryCondition] })
  conditions: QueryCondition[];
}

export class ReconciliationRequest {
  @ApiProperty({ type: [ReconciliationQuery] })
  queries: ReconciliationQuery[];
}