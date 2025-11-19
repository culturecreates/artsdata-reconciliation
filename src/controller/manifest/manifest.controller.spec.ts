import {Test, TestingModule} from "@nestjs/testing";
import {ManifestController} from "./manifest.controller";
import {ManifestService} from "../../service";
import {MANIFEST} from "../../constant";
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import axios from 'axios';

describe('ManifestController', () => {
    let manifestController: ManifestController;
    let validate: any;

    beforeAll(async () => {

        const app: TestingModule = await Test.createTestingModule({
            controllers: [ManifestController],
            providers: [ManifestService]
        }).compile();

        manifestController = app.get<ManifestController>(ManifestController);
        const ajv = new Ajv({ allErrors: true });
        addFormats(ajv);

        // Fetch manifest schema
        const {data: manifestSchema} = await axios.get(
            'https://raw.githubusercontent.com/reconciliation-api/specs/master/1.0-draft/schemas/manifest.json'
        );

        // Fetch referenced schemas
        const {data: dirSchema} = await axios.get(
            'https://raw.githubusercontent.com/reconciliation-api/specs/refs/heads/master/1.0-draft/schemas/dir.json'
        );
        const {data: langSchema} = await axios.get(
            'https://raw.githubusercontent.com/reconciliation-api/specs/refs/heads/master/1.0-draft/schemas/lang.json'
        );
        const {data: swaggerSchema} = await axios.get(
            'https://raw.githubusercontent.com/reconciliation-api/specs/refs/heads/master/1.0-draft/schemas/openapi.json');

        const {data: typeSchema} = await axios.get(
            'https://raw.githubusercontent.com/reconciliation-api/specs/refs/heads/master/1.0-draft/schemas/type.json');

        // Add schemas to Ajv
        ajv.addSchema(dirSchema, 'dir.json');
        ajv.addSchema(langSchema, 'lang.json');
        ajv.addSchema(swaggerSchema, 'open-api.json');
        ajv.addSchema(typeSchema, 'type.json');

        // Compile manifest schema
        validate = ajv.compile(manifestSchema);
    });

    describe("manifest", () => {

        it("should return Service Manifest", () => {
            expect(manifestController.getServiceManifest()).toBe(MANIFEST);
        });

        it('should return true the manifest validation schema', async () => {
            const response = manifestController.getServiceManifest();
            const valid = validate(response);
            if (!valid) console.error(validate.errors);
            expect(valid).toBe(true);
        });

        it('should return false when the manifest is edited to invalid schema', async () => {
            const response = manifestController.getServiceManifest();
            (response as any)['versions'] = "test-version"
            const valid = validate(response);
            if (!valid) console.error(validate.errors);
            expect(valid).toBe(false);
        });
    });
});