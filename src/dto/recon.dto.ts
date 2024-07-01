import { ApiProperty } from "@nestjs/swagger";

class ReconciliationType {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
}

export class MultilingualString {
  @ApiProperty()
  en: string;
  @ApiProperty()
  fr: string;
  @ApiProperty()
  none: string;
}

export class ReconciliationResponse {
  @ApiProperty()
  id: string;
  @ApiProperty({ type: [MultilingualString] })
  name: MultilingualString;
  @ApiProperty({ type: [MultilingualString] })
  disambiguatingDescription: MultilingualString;
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