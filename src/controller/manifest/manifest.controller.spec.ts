import {Test, TestingModule} from "@nestjs/testing";
import {ManifestController} from "./manifest.controller";
import {ManifestService} from "../../service";
import {MANIFEST} from "../../constant";
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import dirSchema from '../../schema/dir.schema.json';
import manifestSchema from '../../schema/manifest.schema.json';
import langSchema from '../../schema/lang.schema.json';
import swaggerSchema from '../../schema/openapi.schema.json';
import typeSchema from '../../schema/type.schema.json';

describe('ManifestController', () => {
    let manifestController: ManifestController;
    let validate: any;

    beforeAll(async () => {

        const app: TestingModule = await Test.createTestingModule({
            controllers: [ManifestController],
            providers: [ManifestService]
        }).compile();

        manifestController = app.get<ManifestController>(ManifestController);
        const ajv = new Ajv({allErrors: true, strict: false });
        addFormats(ajv);

        // Add schemas to Ajv
        ajv.addSchema(dirSchema,"https://reconciliation-api.github.io/specs/draft/schemas/dir.json");
        ajv.addSchema(swaggerSchema,"http://swagger.io/v2/schema.json#" );
        ajv.addSchema(typeSchema,"https://reconciliation-api.github.io/specs/draft/schemas/type.json");
        ajv.addSchema(langSchema,"https://reconciliation-api.github.io/specs/draft/schemas/lang.json" );

        // Compile manifest schema
        validate = ajv.compile(manifestSchema);
    });

    describe("manifest", () => {

        it("should return Service Manifest", () => {
            expect(manifestController.getServiceManifest()).toBe(MANIFEST);
        });

        it('should validate the manifest against the schema and return true', async () => {
            const response = manifestController.getServiceManifest();
            const valid = validate(response);
            if (!valid) console.error(
                validate.errors?.map((error: any) => ({
                    message: error.message,
                    params: error.params,
                    instancePath: error.instancePath,
                }))
            )
            expect(valid).toBe(true);
        });

        it('should return false when the manifest is edited to an invalid schema', async () => {
            const response = manifestController.getServiceManifest();
            const invalidResponse = { ...response, versions: "test-version" };
            const valid = validate(invalidResponse);
            expect(valid).toBe(false);
        });
    });
});