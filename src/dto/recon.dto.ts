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

 class MultilingualString {
  @ApiProperty({ type: [MultilingualValues] })
  values: MultilingualValues[];
}

export class ReconciliationResponse {
  @ApiProperty()
  id: string;
  @ApiProperty({ type: [MultilingualString] })
  name: MultilingualString;
  @ApiProperty({ type: [MultilingualString] })
  description: MultilingualString;
  @ApiProperty({ type: [ReconciliationType] })
  type: ReconciliationType[];
  @ApiProperty()
  score: number;
  @ApiProperty()
  match: boolean;
}

export class ReconciliationQuery {
  @ApiProperty()
  query: string;
  @ApiProperty()
  type: string;

}