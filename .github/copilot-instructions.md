# GitHub Copilot Instructions for Artsdata Reconciliation Service

This document provides guidelines for GitHub Copilot when generating code for the Artsdata Reconciliation Service.

## NestJS Conventions

### Project Structure
Follow NestJS architectural patterns:
- **Modules**: Organize features into modules with clear separation of concerns
- **Providers**: Use services as providers with proper dependency injection
- **Controllers**: Handle HTTP requests and delegate business logic to services
- **DTOs**: Define Data Transfer Objects for all request/response payloads
- **Dependency Injection**: Use constructor-based injection for all dependencies

### Module Organization
- Keep related features grouped in their own modules
- Export only what is necessary from each module
- Register all providers in the module's providers array
- Register all controllers in the module's controllers array

### Service Patterns
- Use services for business logic and data manipulation
- Keep controllers thin - delegate to services
- Use interfaces or abstract classes for service contracts when appropriate
- Avoid circular dependencies; suggest refactoring when they appear
- Use dependency injection for all service dependencies

### Controller Patterns
- Controllers should only handle HTTP-specific concerns
- Use appropriate HTTP method decorators (@Get, @Post, @Put, @Delete, etc.)
- Always use route parameter and query parameter decorators
- Delegate all business logic to services
- Use consistent naming: `ControllerName.methodName()`

## Validation and DTOs

### DTO Requirements
- Create DTOs for all request payloads and complex response structures
- Use `class-validator` decorators for all validation rules
- Use `class-transformer` decorators when type transformation is needed
- Include OpenAPI/Swagger decorators for documentation

### Validation Rules
- Use `@IsNotEmpty()` for required fields
- Use `@IsOptional()` for optional fields
- Use type-specific validators: `@IsString()`, `@IsNumber()`, `@IsBoolean()`, `@IsArray()`, etc.
- Use `@IsEnum()` for enum fields
- Use `@ValidateNested()` with `@Type()` for nested objects
- Use `@ArrayMinSize()` and `@ArrayMaxSize()` for array constraints
- Use `@Min()` and `@Max()` for numeric constraints
- Use `@Matches()` for pattern validation
- Use `@IsUrl()` for URL validation
- Use custom validation messages when appropriate

### DTO Examples
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ExampleDto {
  @ApiProperty({ description: 'Required string field' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Optional number field' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  count?: number;
}
```

## OpenAPI/Swagger Documentation

### Controller Documentation
- Use `@ApiTags()` decorator on all controllers to group endpoints
- Use `@ApiOperation()` decorator on all endpoints to describe their purpose
- Use `@ApiQuery()` decorator for query parameters
- Use `@ApiParam()` decorator for route parameters
- Use `@ApiBody()` decorator for request bodies
- Use `@ApiResponse()` decorator for response types

### DTO Documentation
- Use `@ApiProperty()` for required fields with clear descriptions
- Use `@ApiPropertyOptional()` for optional fields
- Include examples in API decorators when helpful
- Document enums with their possible values

## Testing with Jest

### Test Structure
- Create unit tests for all services and controllers
- Use clear test descriptions with `describe` and `it` blocks
- Group related tests logically
- Test both success and failure scenarios

### Testing Patterns
- Use `@nestjs/testing` module for dependency injection in tests
- Create test modules with `Test.createTestingModule()`
- Mock external dependencies and services
- Use `jest.mock()` for module mocking
- Use `jest.fn()` for function mocking
- Clear mocks between tests using `beforeEach` or `afterEach`

### Test Example
```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: jest.Mocked<DependencyType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceName,
        {
          provide: DependencyName,
          useValue: {
            method: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
    mockDependency = module.get(DependencyName);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle success case', async () => {
    mockDependency.method.mockResolvedValue('expected result');
    const result = await service.methodUnderTest();
    expect(result).toBe('expected result');
    expect(mockDependency.method).toHaveBeenCalledTimes(1);
  });
});
```

## Code Quality

### Linting and Formatting
- Follow ESLint + Prettier conventions
- Use consistent indentation (2 spaces)
- Use double quotes for strings
- Remove unused imports
- Use trailing commas in multi-line arrays and objects
- Run `npm run lint` to check for linting issues
- Run `npm run format` to auto-format code

### Comments and Documentation
- Add comments explaining intent for complex logic
- Document edge cases and special handling
- Avoid obvious comments that duplicate what the code does
- Use JSDoc comments for public APIs and complex functions
- Document assumptions and constraints

### Best Practices
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Avoid nested callbacks - use async/await
- Handle errors appropriately with try-catch blocks
- Use TypeScript types strictly - avoid `any` type
- Use enums for fixed sets of values
- Use constants for magic numbers and strings
- Follow DRY (Don't Repeat Yourself) principle

## Import Organization
- Group imports logically: NestJS, third-party, local
- Use absolute imports from src root when appropriate
- Order imports: decorators, interfaces, services, DTOs, enums, constants
- Remove unused imports

## Error Handling
- Use NestJS built-in exceptions (BadRequestException, NotFoundException, etc.)
- Provide meaningful error messages
- Log errors appropriately
- Validate input at the controller level
- Handle edge cases gracefully

## Naming Conventions
- Use PascalCase for class names (components, services, modules)
- Use camelCase for variables, functions, and methods
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that convey purpose
- Prefix private properties with underscore (e.g., `_propertyName`)
- Suffix DTOs with `.dto.ts`
- Suffix controllers with `.controller.ts`
- Suffix services with `.service.ts`
- Suffix modules with `.module.ts`
- Suffix tests with `.spec.ts`

## Project-Specific Guidelines
- This is a reconciliation service for Artsdata cultural data
- The service works with events, organizations, people, and places
- All queries interact with a graph database
- Support for multiple languages (enum: LanguageEnum)
- Match types include: name, identifier, property, and type
- Use existing enums: MatchTypeEnum, MatchQualifierEnum, MatchQuantifierEnum, LanguageEnum
