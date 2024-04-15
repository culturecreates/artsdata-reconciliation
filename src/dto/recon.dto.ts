import { ApiProperty } from "@nestjs/swagger";

class ReconciliationType {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
}

export class ReconciliationResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  disambiguatingDescription: string;
  @ApiProperty({ type: [ReconciliationType] })
  type: ReconciliationType[];
  @ApiProperty()
  score: number;
  @ApiProperty()
  match: boolean;
}

export class ReconciliationRequest {
  @ApiProperty()
  query: string;
  @ApiProperty()
  type: string;

}