export interface ParsedEndpoint {
  operationId: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  summary: string;
  description: string;
  parameters: ParsedParameter[];
  requestBody?: ParsedRequestBody;
  responses: Record<string, ParsedResponse>;
  security: Record<string, string[]>[];
  tags: string[];
  deprecated: boolean;
}

export interface ParsedParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required: boolean;
  schema: any;
  description: string;
  example?: any;
}

export interface ParsedRequestBody {
  required: boolean;
  contentType: string;
  schema: any;
  description?: string;
}

export interface ParsedResponse {
  statusCode: string;
  description: string;
  schema?: any;
  headers?: Record<string, any>;
}

export interface ParsedAPI {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers: { url: string; description?: string }[];
  endpoints: ParsedEndpoint[];
  securitySchemes: Record<string, any>;
  tags: { name: string; description?: string }[];
}

export async function parseOpenAPISpec(
  specPath: string,
  basePath: string
): Promise<ParsedAPI> {
  const path = await import('path');
  const SwaggerParser = (await import('@apidevtools/swagger-parser')).default;

  const fullPath = path.resolve(basePath, specPath);
  const api = await SwaggerParser.dereference(fullPath) as any;

  const endpoints: ParsedEndpoint[] = [];

  for (const [pathStr, pathItem] of Object.entries(api.paths || {})) {
    const pathObj = pathItem as Record<string, any>;
    const commonParams = pathObj.parameters || [];

    for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
      const operation = pathObj[method];
      if (!operation) continue;

      const allParams = [...commonParams, ...(operation.parameters || [])];

      endpoints.push({
        operationId: operation.operationId || `${method}_${pathStr.replace(/[^a-zA-Z0-9]/g, '_')}`,
        method,
        path: pathStr,
        summary: operation.summary || '',
        description: operation.description || '',
        parameters: allParams.map((p: any) => ({
          name: p.name,
          in: p.in,
          required: p.required || false,
          schema: p.schema || {},
          description: p.description || '',
          example: p.example,
        })),
        requestBody: extractRequestBody(operation),
        responses: extractResponses(operation),
        security: operation.security || api.security || [],
        tags: operation.tags || [],
        deprecated: operation.deprecated || false,
      });
    }
  }

  return {
    info: api.info || { title: 'API', version: '1.0.0' },
    servers: api.servers || (api.host ? [{ url: `${api.schemes?.[0] || 'https'}://${api.host}${api.basePath || ''}` }] : []),
    endpoints,
    securitySchemes: api.components?.securitySchemes || api.securityDefinitions || {},
    tags: api.tags || [],
  };
}

function extractRequestBody(operation: any): ParsedRequestBody | undefined {
  if (!operation.requestBody) return undefined;

  const content = operation.requestBody.content || {};
  const contentType = Object.keys(content)[0] || 'application/json';
  const mediaType = content[contentType] || {};

  return {
    required: operation.requestBody.required || false,
    contentType,
    schema: mediaType.schema || {},
    description: operation.requestBody.description,
  };
}

function extractResponses(operation: any): Record<string, ParsedResponse> {
  const responses: Record<string, ParsedResponse> = {};

  for (const [code, response] of Object.entries(operation.responses || {})) {
    const res = response as any;
    const content = res.content || {};
    const contentType = Object.keys(content)[0];
    const schema = contentType ? content[contentType]?.schema : res.schema;

    responses[code] = {
      statusCode: code,
      description: res.description || '',
      schema,
      headers: res.headers,
    };
  }

  return responses;
}

/**
 * Generate a slug-friendly path for an API endpoint
 */
export function endpointToSlug(endpoint: ParsedEndpoint): string {
  const tag = endpoint.tags[0] || 'api';
  const id = endpoint.operationId
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  return `api-reference/${tag}/${id}`;
}
