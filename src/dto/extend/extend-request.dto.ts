import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {ArrayMinSize, IsBoolean, IsOptional, IsString, ValidateNested} from "class-validator";
import {Transform, Type} from "class-transformer";

export class ExtendQueryProperty {
    @ApiProperty({type: String})
    @IsString()
    id: string;
    @ApiPropertyOptional({type: Boolean, default: false})
    @IsOptional()
    @IsBoolean()
    expand?: boolean;
}

export class DataExtensionQueryDTO {

    @ApiProperty({type: [String]})
    @IsString({each: true})
    @ArrayMinSize(1)
    @Transform(({value}) =>
        Array.isArray(value) ? value.map((id) => (typeof id === 'string' ? id.trim() : id)) : value
    )
    ids: string[];

    @ApiProperty({type: [ExtendQueryProperty]})
    @ArrayMinSize(1)
    @ValidateNested({each: true})
    @Type(() => ExtendQueryProperty)
    properties: ExtendQueryProperty[];
}
