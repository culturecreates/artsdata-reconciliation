import { ApiProperty } from "@nestjs/swagger";

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