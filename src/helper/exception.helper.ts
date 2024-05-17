import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';

/**
 * @description The error class that help to throw when exception occurs.
 */
export class Exception {
    /**
     * @description Exception for the BadRequest.
     * @param {string} msg
     */
    static badRequest(msg: string) {
        throw new BadRequestException(msg);
    }

    /**
     * @description Exception for the Unauthorized.
     * @param {string} msg
     */
    static unauthorized(msg: string) {
        throw new UnauthorizedException(msg);
    }

    /**
     * @description Exception for the NotFound.
     * @param {string} msg
     */
    static notFound(msg: string) {
        throw new NotFoundException(msg);
    }

    /**
     * @description Exception for the Forbidden.
     * @param {string} msg
     */
    static forbidden(msg: string) {
        throw new ForbiddenException(msg);
    }

    /**
     * @description Exception for the InternalServerError.
     * @param {string} msg
     */
    static internalServerError(msg: string) {
        throw new InternalServerErrorException(msg);
    }

    /**
     * @description Exception for the MethodNotAllowed.
     * @param {string} msg
     */
    static conflict(msg: string, description: string) {
        throw new ConflictException(msg, description);
    }
}
