import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize , IsString , ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ExtendQueryProperty {
  @ApiProperty({ type: String })
  @IsString()
  id: string;
}

export class DataExtensionQueryDTO {

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  @ArrayMinSize(1)
  ids: string[];

  @ApiProperty({ type: [ExtendQueryProperty] })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExtendQueryProperty)
  properties: ExtendQueryProperty[];
}
