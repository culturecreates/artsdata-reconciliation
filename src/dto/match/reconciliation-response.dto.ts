import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

class ReconciliationType {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
}

class ReconciliationFeature {
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    value: number;
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
  startDate: string;
  @ApiProperty()
  match: boolean;
  @ApiProperty({ type: [ReconciliationType] })
  type: ReconciliationType[];
    @ApiPropertyOptional({ type: [ReconciliationFeature] })
    features?: ReconciliationFeature[]
}

export class ReconciliationResults {
  @ApiProperty()
  candidates: ResultCandidates[];
}

export class ReconciliationResponse {
  @ApiProperty({ type: ReconciliationResults })
  results: ReconciliationResults[];
}

