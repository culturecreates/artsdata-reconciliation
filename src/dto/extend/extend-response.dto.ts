import { ApiProperty , ApiPropertyOptional } from "@nestjs/swagger";
import { IdAndName , MultiLingualValues } from "../common";

export class ProposedExtendProperty {
  @ApiProperty()
  type: string;
  @ApiProperty()
  properties: IdAndName[];
}


class DataExtensionResponseMetaData extends IdAndName {
  @ApiPropertyOptional({ type: IdAndName })
  type: IdAndName;
}

export class DataExtensionResultProperties {
  @ApiProperty()
  id: string;
  @ApiProperty()
  values?: MultiLingualValues[];
  @ApiPropertyOptional({ type: [DataExtensionResultProperties] })
  properties?: DataExtensionResultProperties[];
}

class DataExtensionResultRow {
  @ApiProperty()
  id: string;
  @ApiProperty()
  properties: DataExtensionResultProperties[];
}


export class DataExtensionResponseDTO {
  @ApiProperty()
  meta: DataExtensionResponseMetaData;
  @ApiProperty()
  rows: DataExtensionResultRow[];
}