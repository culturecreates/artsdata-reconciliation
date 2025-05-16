import { ApiProperty } from "@nestjs/swagger";
import { IdAndName } from "../common";

export class ProposedExtendProperty {
  @ApiProperty()
  type: string;
  @ApiProperty()
  properties: IdAndName[];
}