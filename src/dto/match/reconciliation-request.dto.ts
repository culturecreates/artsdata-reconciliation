import { ApiProperty , ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize ,
  IsArray ,
  IsBoolean ,
  IsEnum ,
  IsIn ,
  IsNotEmpty ,
  IsNumber ,
  IsOptional ,
  IsString ,
  Matches ,
  Min ,
  ValidateIf ,
  ValidateNested
} from "class-validator";
import { MatchQualifierEnum , MatchQuantifierEnum , MatchTypeEnum } from "../../enum";


export class QueryCondition {

  @ApiProperty({ required: true })
  @IsEnum(MatchTypeEnum)
  @IsNotEmpty()
  matchType: MatchTypeEnum|String;

  //TODO Add support to nested v
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/ , { message: "v must not be empty or contain only whitespace" })
  v: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.matchType === "property")
  @IsString()
  @IsNotEmpty()
  pid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(MatchQuantifierEnum)
  matchQuantifier?: MatchQuantifierEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(MatchQualifierEnum)
  matchQualifier?: MatchQualifierEnum;
}

export class ReconciliationQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(["schema:Event" , "schema:Person" , "schema:Place" , "dbo:Agent" , "schema:Organization" , "skos:Concept" ,
    "ado:EventType"])
  type: string;

  @IsOptional()
  @ApiPropertyOptional()
  @IsNumber()
  @Min(1 , { message: "limit must be a positive integer" })
  limit?: number;

  @ApiProperty({ type: [QueryCondition] })
  @ArrayMinSize(1)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryCondition)
  conditions: QueryCondition[];
}

export class ReconciliationRequest {
  @ApiProperty({ type: [ReconciliationQuery] })
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => ReconciliationQuery)
  queries: ReconciliationQuery[];
}