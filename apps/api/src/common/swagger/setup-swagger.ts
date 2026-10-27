import type { INestApplication } from '@nestjs/common';
import { PATH_METADATA, ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';
import { ModulesContainer } from '@nestjs/core';
import {
  ApiBody,
  ApiQuery,
  ApiTags,
  DocumentBuilder,
  type SchemaObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { z } from 'zod';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

export const DOCS_PATH = 'docs';

type RouteArg = { index: number; data?: unknown; pipes?: unknown[] };

function toOpenApiSchema(schema: z.ZodType): SchemaObject {
  return z.toJSONSchema(schema, {
    target: 'openapi-3.0',
    io: 'input',
    unrepresentable: 'any',
  }) as SchemaObject;
}

function controllerTag(controller: object): string {
  const path: unknown = Reflect.getMetadata(PATH_METADATA, controller);
  const first = Array.isArray(path) ? path[0] : path;
  return typeof first === 'string' && first !== '/' ? first : 'root';
}

/**
 * Controllers validate with `@Body(new ZodValidationPipe(schema))` instead of
 * DTO classes, so Swagger cannot see the shape. Read the schema off each pipe
 * and attach it as `@ApiBody` / `@ApiQuery` before the document is built.
 * Each controller is tagged with its path so the UI groups routes by resource.
 */
function documentZodRoutes(app: INestApplication): void {
  for (const moduleRef of app.get(ModulesContainer).values()) {
    for (const { metatype } of moduleRef.controllers.values()) {
      if (!metatype) {
        continue;
      }
      ApiTags(controllerTag(metatype))(metatype);
      const prototype = metatype.prototype as object;
      for (const method of Object.getOwnPropertyNames(prototype)) {
        const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, metatype, method) as
          Record<string, RouteArg> | undefined;
        const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
        if (!args || !descriptor) {
          continue;
        }
        for (const [key, arg] of Object.entries(args)) {
          const pipe = arg.pipes?.find((p) => p instanceof ZodValidationPipe);
          if (!pipe) {
            continue;
          }
          const schema = toOpenApiSchema(pipe.schema);
          const paramType = Number(key.split(':')[0]);
          if (paramType === RouteParamtypes.BODY) {
            ApiBody({ schema })(prototype, method, descriptor);
          } else if (paramType === RouteParamtypes.QUERY && arg.data === undefined) {
            const required = new Set(schema.required ?? []);
            for (const [name, property] of Object.entries(schema.properties ?? {})) {
              ApiQuery({ name, required: required.has(name), schema: property })(
                prototype,
                method,
                descriptor,
              );
            }
          }
        }
      }
    }
  }
}

/** Serves Swagger UI at /api/docs (JSON at /api/docs-json) and redirects / there. */
export function setupSwagger(app: INestApplication): void {
  documentZodRoutes(app);
  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription(
      'Call `POST /api/auth/login` first. It sets httpOnly auth cookies that the browser sends with every later request.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(DOCS_PATH, app, document, {
    useGlobalPrefix: true,
    customSiteTitle: 'Portfolio API',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
  });

  const http = app.getHttpAdapter();
  http.get('/', (_req: unknown, res: unknown) => http.redirect(res, 302, `/api/${DOCS_PATH}`));
}
