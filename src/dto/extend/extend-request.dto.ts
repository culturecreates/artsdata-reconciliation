import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {ArrayMinSize, IsEnum, IsOptional, IsString, ValidateNested} from "class-validator";
import {Transform, Type} from "class-transformer";
import {ExtendPropertySettingsEnum} from "../../enum";

export class ExtendQueryPropertySettings {
    @ApiProperty({required: false})
    @IsEnum({ExtendPropertySettingsEnum})
    content: ExtendPropertySettingsEnum
}

export class ExtendQueryProperty {
    @ApiProperty({type: String})
    @IsString()
    id: string;

    @ApiPropertyOptional({type: ExtendQueryPropertySettings, default: false})
    @IsOptional()
    settings?: ExtendQueryPropertySettings;
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
