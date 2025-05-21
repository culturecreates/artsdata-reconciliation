import { ApiProperty , ApiPropertyOptional } from "@nestjs/swagger";
import { LanguageEnum } from "../../enum";

export class IdAndName {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
}

export class MultiLingualValues {
  @ApiPropertyOptional()
  str?: string;
  @ApiPropertyOptional()
  id?: string;
  @ApiPropertyOptional()
  lang?: LanguageEnum;
}

export class IdObject {
  @ApiProperty()
  id: string;
}
