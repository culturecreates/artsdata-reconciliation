import { ApiProperty } from "@nestjs/swagger";

export class IdAndName {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
}
