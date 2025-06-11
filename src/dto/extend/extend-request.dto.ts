import { ApiProperty , ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize , IsBoolean , IsOptional , IsString , ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ExtendQueryProperty {
  @ApiProperty({ type: String })
  @IsString()
  id: string;
  @ApiPropertyOptional({ type: Boolean , default: false })
  @IsOptional()
  @IsBoolean()
  expand: boolean;
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
