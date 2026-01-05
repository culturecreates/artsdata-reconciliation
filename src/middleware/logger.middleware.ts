import {Injectable, Logger, NestMiddleware} from "@nestjs/common";
import {NextFunction, Request, Response} from "express";


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly _logger = new Logger("HTTP");

    use(request: Request, response: Response, next: NextFunction): void {
        const {ip, method, originalUrl, protocol} = request;
        const userAgent = request.get("user-agent") || "";
        const startTime = Date.now();

        response.on("finish", () => {
            const elapsed = Date.now() - startTime;
            this._logger.log(
                `Responded to ${method} ${originalUrl} with ${protocol} ${response.statusCode} - ${userAgent} ${ip} - ${elapsed}ms`
            );
        });
        next();
    }
}