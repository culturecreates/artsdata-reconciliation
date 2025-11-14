import { ApiProperty } from "@nestjs/swagger";

class DefaultType {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
}

class View {
  @ApiProperty({ example: "http://kg.artsdata.ca/resource/{{id}}" })
  url: string;
}

class Preview {
  @ApiProperty({ example: 200 })
  height: number;
  @ApiProperty({ example: 350 })
  width: number;
  @ApiProperty({ example: "http://api.artsdata.ca/resource/{{id}}" })
  url: string;
}

class Type {
  @ApiProperty({ example: "/en/suggest/type" })
  service_path: string;
  @ApiProperty({ example: "https://wikidata.reconci.link" })
  service_url: string;
}

class Suggest {
  @ApiProperty({ type: Type })
  type: Type;
}

export class ServiceManifestResponse {
  @ApiProperty({ type: [String], example: ["0.3"] })
  versions: string[];
  @ApiProperty({ example: "Artsdata.ca Reconciliation Service" })
  name: String;
  @ApiProperty({
    type: [DefaultType], example: [
      {
        "id": "schema:Event",
        "name": "Event"
      },
      {
        "id": "schema:Person",
        "name": "Person"
      },
      {
        "id": "dbo:Agent",
        "name": "Agent"
      },
      {
        "id": "schema:Place",
        "name": "Place"
      },
      {
        "id": "schema:Organization",
        "name": "Organization"
      },
      {
        "id": "skos:Concept",
        "name": "Concept"
      },
      {
        "id": "ado:EventType",
        "name": "Artsdata Event Type"
      }
    ]
  })
  defaultTypes: DefaultType[];
  @ApiProperty({ type: View })
  view: View;
  @ApiProperty({ type: Preview })
  preview: Preview;
}