import {Test, TestingModule} from '@nestjs/testing';
import {HttpService} from './http.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpService', () => {
    let httpService: HttpService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [HttpService],
        }).compile();

        httpService = module.get<HttpService>(HttpService);
    });

    it('should send Authorization header when token is provided', async () => {
        mockedAxios.post.mockResolvedValueOnce({status: 200, data: {results: {bindings: []}}});

        await httpService.postRequest('http://localhost:7200', 'query=test', 'my-token');

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'http://localhost:7200',
            'query=test',
            expect.objectContaining({
                headers: expect.objectContaining({Authorization: 'my-token'}),
            })
        );
    });

    it('should omit Authorization header when no token is provided', async () => {
        mockedAxios.post.mockResolvedValueOnce({status: 200, data: {results: {bindings: []}}});

        await httpService.postRequest('http://localhost:7200', 'query=test');

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'http://localhost:7200',
            'query=test',
            expect.objectContaining({
                headers: expect.not.objectContaining({Authorization: expect.anything()}),
            })
        );
    });

    it('should propagate errors to the caller', async () => {
        mockedAxios.post.mockRejectedValueOnce({
            response: {status: 401},
            message: 'Request failed with status code 401',
        });

        await expect(
            httpService.postRequest('http://localhost:7200', 'query=test', 'expired-token')
        ).rejects.toMatchObject({response: {status: 401}});
    });
});