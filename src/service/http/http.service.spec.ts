import {Test, TestingModule} from '@nestjs/testing';
import {HttpService} from './http.service';
import {ArtsdataService} from '../artsdata';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpService', () => {
    let httpService: HttpService;
    let artsdataService: Partial<ArtsdataService>;

    beforeEach(async () => {
        jest.clearAllMocks();

        artsdataService = {
            refreshToken: jest.fn().mockResolvedValue(true),
            getToken: jest.fn().mockReturnValue('new-valid-token'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HttpService,
                {provide: ArtsdataService, useValue: artsdataService},
            ],
        }).compile();

        httpService = module.get<HttpService>(HttpService);
    });

    it('should retry with refreshed token on 401', async () => {
        mockedAxios.post
            .mockRejectedValueOnce({
                response: {status: 401},
                message: 'Request failed with status code 401',
            })
            .mockResolvedValueOnce({
                status: 200,
                data: {results: {bindings: [{name: {value: 'Festival'}}]}},
            });

        const result = await httpService.postRequest(
            'http://localhost:7200/repositories/artsdata',
            'query=SELECT%20*%20WHERE%20%7B%7D',
            'expired-token'
        );

        expect(artsdataService.refreshToken).toHaveBeenCalledTimes(1);

        expect(mockedAxios.post).toHaveBeenCalledTimes(2);

        expect(mockedAxios.post).toHaveBeenLastCalledWith(
            expect.any(String),
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({Authorization: 'new-valid-token'}),
            })
        );

        expect(result.results.bindings[0].name.value).toBe('Festival');
    });

    it('should not retry infinitely — stops after one refresh attempt', async () => {
        mockedAxios.post
            .mockRejectedValueOnce({
                response: {status: 401},
                message: 'Request failed with status code 401',
            })
            .mockRejectedValueOnce({
                response: {status: 401},
                message: 'Request failed with status code 401',
            });

        artsdataService.refreshToken = jest.fn().mockResolvedValue(true);

        await expect(
            httpService.postRequest(
                'http://localhost:7200/repositories/artsdata',
                'query=SELECT%20*%20WHERE%20%7B%7D',
                'expired-token'
            )
        ).rejects.toThrow('Request failed with status code 401');

        expect(mockedAxios.post).toHaveBeenCalledTimes(2);

        expect(artsdataService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should not retry if token refresh itself fails', async () => {
        mockedAxios.post.mockRejectedValueOnce({
            response: {status: 401},
            message: 'Request failed with status code 401',
        });

        artsdataService.refreshToken = jest.fn().mockResolvedValue(false);

        await expect(
            httpService.postRequest(
                'http://localhost:7200/repositories/artsdata',
                'query=SELECT%20*%20WHERE%20%7B%7D',
                'expired-token'
            )
        ).rejects.toThrow('GraphDB authentication failed after token refresh attempt.');

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(artsdataService.refreshToken).toHaveBeenCalledTimes(1);
    });
});