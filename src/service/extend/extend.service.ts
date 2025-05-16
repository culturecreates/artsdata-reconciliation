import { Injectable } from "@nestjs/common";
import { ArtsdataService } from "../artsdata";
import { EntityClassEnum } from "../../enum/entity-class.enum";
import { PROPOSED_EXTEND_PROPERTIES_METADATA } from "../../constant/proposed-extend-properties.constants";
import { Exception } from "../../helper";
import { ProposedExtendProperty } from "../../dto/extend";


@Injectable()
export class ExtendService {

  constructor(private readonly _artsdataService: ArtsdataService) {
  }


  async getDataExtension(rawQueries: any): Promise<any> {
  }

  getProposedProperties(entityType: EntityClassEnum): ProposedExtendProperty {
    switch (entityType) {
      case EntityClassEnum.EVENT:
        return PROPOSED_EXTEND_PROPERTIES_METADATA.EVENT;
      case EntityClassEnum.PLACE:
        return PROPOSED_EXTEND_PROPERTIES_METADATA.PLACE;
      case EntityClassEnum.PERSON:
        return PROPOSED_EXTEND_PROPERTIES_METADATA.PERSON;
      case EntityClassEnum.ORGANIZATION:
        return PROPOSED_EXTEND_PROPERTIES_METADATA.ORGANIZATION;
      default:
        throw Exception.badRequest("Invalid entity type");
    }
  }
}
