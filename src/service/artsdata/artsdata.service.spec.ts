import {Test, TestingModule} from '@nestjs/testing';
import {ArtsdataService} from './artsdata.service';
import {HttpService} from '../http';
import axios from 'axios';

describe('ArtsdataService — SPARQL execution and token refresh', () => {
    let artsdataService: ArtsdataService;
    let httpService: Partial<HttpService>;

    beforeEach(async () => {
        jest.clearAllMocks();

        httpService = {
            postRequest: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArtsdataService,
                {provide: HttpService, useValue: httpService},
            ],
        }).compile();

        artsdataService = module.get<ArtsdataService>(ArtsdataService);

        // Pre-set a token as if startup auth already ran
        (artsdataService as any).token = 'initial-token';
    });

    it('should return SPARQL results on a successful request', async () => {
        const mockData = {results: {bindings: [{name: {value: 'Festival'}}]}};
        (httpService.postRequest as jest.Mock).mockResolvedValueOnce(mockData);

        const result = await artsdataService.executeSparqlQuery('SELECT * WHERE {}');

        expect(result).toEqual(mockData);
        expect(httpService.postRequest).toHaveBeenCalledTimes(1);
    });

    it('should refresh token and retry once on 401', async () => {
        const mockData = {results: {bindings: [{name: {value: 'Festival'}}]}};

        (httpService.postRequest as jest.Mock)
            .mockRejectedValueOnce({response: {status: 401}, message: 'Unauthorized'})
            .mockResolvedValueOnce(mockData);

        // Mock refreshToken to succeed and update token
        jest.spyOn(artsdataService, 'refreshToken').mockImplementation(async () => {
            (artsdataService as any).token = 'refreshed-token';
            return true;
        });

        const result = await artsdataService.executeSparqlQuery('SELECT * WHERE {}');

        expect(artsdataService.refreshToken).toHaveBeenCalledTimes(1);
        expect(httpService.postRequest).toHaveBeenCalledTimes(2);
        expect(httpService.postRequest).toHaveBeenLastCalledWith(
            expect.any(String),
            expect.any(String),
            'refreshed-token'
        );
        expect(result).toEqual(mockData);
    });

    it('should throw if token refresh fails', async () => {
        (httpService.postRequest as jest.Mock)
            .mockRejectedValueOnce({response: {status: 401}, message: 'Unauthorized'});

        jest.spyOn(artsdataService, 'refreshToken').mockResolvedValue(false);

        await expect(
            artsdataService.executeSparqlQuery('SELECT * WHERE {}')
        ).rejects.toThrow('GraphDB authentication failed after token refresh attempt.');

        expect(httpService.postRequest).toHaveBeenCalledTimes(1);
    });

    it('should throw if request fails again after token refresh', async () => {
        (httpService.postRequest as jest.Mock)
            .mockRejectedValueOnce({response: {status: 401}, message: 'Unauthorized'})
            .mockRejectedValueOnce({response: {status: 401}, message: 'Unauthorized'});

        jest.spyOn(artsdataService, 'refreshToken').mockImplementation(async () => {
            (artsdataService as any).token = 'refreshed-token';
            return true;
        });

        await expect(
            artsdataService.executeSparqlQuery('SELECT * WHERE {}')
        ).rejects.toThrow('SPARQL query failed after token refresh:');

        // Called twice — original + one retry, no infinite loop
        expect(httpService.postRequest).toHaveBeenCalledTimes(2);
        expect(artsdataService.refreshToken).toHaveBeenCalledTimes(1);
    });
});

describe('ArtsdataService — SPARQL update', () => {
    let artsdataService: ArtsdataService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArtsdataService,
                {provide: HttpService, useValue: {postRequest: jest.fn()}},
            ],
        }).compile();

        artsdataService = module.get<ArtsdataService>(ArtsdataService);
        (artsdataService as any).token = 'initial-token';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should POST to the /statements endpoint with an update= parameter', async () => {
        jest.spyOn(axios, 'post').mockResolvedValueOnce({status: 204, data: ''});

        await artsdataService.executeSparqlUpdate('INSERT DATA { <ex:1> a <ex:Type> }');

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/statements'),
            expect.stringContaining('update=INSERT'),
            expect.objectContaining({
                headers: expect.objectContaining({'Content-Type': 'application/x-www-form-urlencoded'}),
            }),
        );
    });

    it('should include Authorization header when a token is set', async () => {
        jest.spyOn(axios, 'post').mockResolvedValueOnce({status: 204, data: ''});

        await artsdataService.executeSparqlUpdate('INSERT DATA { <ex:1> a <ex:Type> }');

        expect(axios.post).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({Authorization: 'initial-token'}),
            }),
        );
    });

    it('should throw an InternalServerError when the update request fails', async () => {
        jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Connection refused'));

        await expect(
            artsdataService.executeSparqlUpdate('INSERT DATA {}'),
        ).rejects.toThrow('Error executing SPARQL update: Connection refused');
    });
});