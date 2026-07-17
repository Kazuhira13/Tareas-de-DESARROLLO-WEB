/**
 * HTTP Inspector CLI
 *
 * Tarea de la Sesión 1: Fundamentos de la Web
 *
 * Esta tarea NO usa la red, ni async/await, ni librerías externas.
 * Solo la biblioteca estándar de Node + tipos básicos de TypeScript.
 *
 * Idea: aplicar lo que aprendiste sobre HTTP (URLs, métodos, códigos
 * de estado y cabeceras) implementando pequeñas funciones puras.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Resultado de analizar una URL. */
export interface UrlParts {
  /** Protocolo tal como lo devuelve la WHATWG URL, p. ej. "https:". */
  protocol: string;
  /** Host (puede incluir puerto), p. ej. "api.ejemplo.com:443". */
  host: string;
  /** Ruta, p. ej. "/users". */
  pathname: string;
  /** Query string con el "?" inicial, p. ej. "?id=1&name=Ana". */
  search: string;
  /** Lista de pares [clave, valor] de los query params. */
  query: Array<[string, string]>;
}

/** Categoría de un código de estado HTTP. */
export type StatusCategory =
  | "1xx Informativo"
  | "2xx Éxito"
  | "3xx Redirección"
  | "4xx Error del cliente"
  | "5xx Error del servidor"
  | "Desconocido";

/** Mapa de cabeceras HTTP. */
export type Headers = Record<string, string>;

// ---------------------------------------------------------------------------
// Funciones principales
// ---------------------------------------------------------------------------

/**
 * Analiza una URL y devuelve sus componentes principales.
 *
 * @param url - URL completa que se desea analizar.
 * @returns Un objeto con el protocolo, host, ruta, búsqueda y parámetros.
 * @throws {TypeError} Si la URL proporcionada no tiene un formato válido.
 */
export function parseUrl(url: string): UrlParts {
  const parsedUrl = new URL(url);

  return {
    protocol: parsedUrl.protocol,
    host: parsedUrl.host,
    pathname: parsedUrl.pathname,
    search: parsedUrl.search,
    query: Array.from(parsedUrl.searchParams.entries()),
  };
}

/**
 * Clasifica un código de estado HTTP según su rango.
 *
 * @param code - Código de estado HTTP que se desea clasificar.
 * @returns La categoría correspondiente o "Desconocido" si está fuera
 * del rango comprendido entre 100 y 599.
 */
export function classifyStatus(code: number): StatusCategory {
  if (code >= 100 && code <= 199) {
    return "1xx Informativo";
  }

  if (code >= 200 && code <= 299) {
    return "2xx Éxito";
  }

  if (code >= 300 && code <= 399) {
    return "3xx Redirección";
  }

  if (code >= 400 && code <= 499) {
    return "4xx Error del cliente";
  }

  if (code >= 500 && code <= 599) {
    return "5xx Error del servidor";
  }

  return "Desconocido";
}

/**
 * Convierte un texto con cabeceras HTTP en un objeto de clave y valor.
 *
 * Las líneas vacías o que no contienen el separador ":" son ignoradas.
 * Los espacios alrededor del nombre y del valor son eliminados.
 *
 * @param text - Texto que contiene una o varias cabeceras HTTP.
 * @returns Un objeto con los nombres y valores de las cabeceras encontradas.
 */
export function parseHeaders(text: string): Headers {
  const headers: Headers = {};
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const name = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (name.length === 0) {
      continue;
    }

    headers[name] = value;
  }

  return headers;
}

/**
 * Genera un resumen legible de una petición HTTP.
 *
 * Combina el análisis de la URL, la clasificación del código de estado
 * y el procesamiento de las cabeceras.
 *
 * @param url - URL completa de la petición.
 * @param status - Código de estado HTTP.
 * @param headersText - Cabeceras HTTP expresadas como texto.
 * @returns Un resumen con la URL, protocolo, host, ruta, estado y cabeceras.
 * @throws {TypeError} Si la URL proporcionada no tiene un formato válido.
 */
export function summarizeRequest(
  url: string,
  status: number,
  headersText: string
): string {
  const urlParts = parseUrl(url);
  const statusCategory = classifyStatus(status);
  const headers = parseHeaders(headersText);

  const formattedHeaders = Object.entries(headers)
    .map(([name, value]) => `- ${name}: ${value}`)
    .join("\n");

  const headersSummary =
    formattedHeaders.length > 0 ? formattedHeaders : "Sin cabeceras";

  return [
    `URL: ${url}`,
    `Protocolo: ${urlParts.protocol}`,
    `Host: ${urlParts.host}`,
    `Ruta: ${urlParts.pathname}`,
    `Estado: ${status} - ${statusCategory}`,
    "Cabeceras:",
    headersSummary,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// CLI (opcional, pero recomendado para probar manualmente)
// ---------------------------------------------------------------------------

if (require.main === module) {
  const [, , cmd, ...args] = process.argv;
  try {
    if (cmd === "parse-url" && args[0]) {
      const parts = parseUrl(args[0]);
      console.log(JSON.stringify(parts, null, 2));
    } else if (cmd === "status" && args[0]) {
      const cat = classifyStatus(Number(args[0]));
      console.log(cat);
    } else if (cmd === "headers" && args.length > 0) {
      const h = parseHeaders(args.join(" "));
      console.log(JSON.stringify(h, null, 2));
    } else if (cmd === "summary" && args.length >= 2) {
      const [url, status, ...rest] = args;
      console.log(summarizeRequest(url, Number(status), rest.join(" ")));
    } else {
      console.log("Uso:");
      console.log('  npm start parse-url "https://ejemplo.com/path?a=1"');
      console.log("  npm start status 404");
      console.log('  npm start headers "Content-Type: application/json"');
      console.log('  npm start summary "https://x.com" 200 "Content-Type: application/json"');
    }
  } catch (e) {
    console.error("Error:", (e as Error).message);
    process.exit(1);
  }
}
