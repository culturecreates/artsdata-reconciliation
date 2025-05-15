import {
  CallHandler ,
  ExecutionContext ,
  HttpException ,
  HttpStatus ,
  Injectable ,
  NestInterceptor
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class HeaderValidationInterceptor implements NestInterceptor {

  constructor(
    private readonly expectedHeaderName: string ,
    private readonly expectedHeaderValues: string[]) {
  }

  intercept(context: ExecutionContext , next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const headerValue = request.headers[this.expectedHeaderName.toLowerCase()]; // Headers are case-insensitive

    if (!headerValue || !this.expectedHeaderValues.includes(headerValue)) {
      throw new HttpException(
        `Invalid or missing header: '${this.expectedHeaderName}'. Expected one of: ${this.expectedHeaderValues.join(", ")}` ,
        HttpStatus.BAD_REQUEST
      );
    }

    return next.handle();
  }
}