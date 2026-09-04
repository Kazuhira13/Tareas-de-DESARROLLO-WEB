/**
 * Servidor HTTP con Node.js — Tarea Sesión 5
 * Universidad Mariano Gálvez de Guatemala · Desarrollo Web
 *
 * Implementa las funciones marcadas con TODO para que los tests pasen.
 * No cambies los nombres exportados ni su firma.
 *
 * Temas de la sesión aplicados aquí:
 *   - process.argv            → parsearArgumentos
 *   - variables de entorno    → obtenerConfig
 *   - módulo os               → infoSistema
 *   - EventEmitter            → crearLogger
 *   - módulo fs/promises      → leerMensajes / agregarMensaje
 *   - módulo http             → crearServidor / iniciarServidor
 */

import http from 'node:http';
import { EventEmitter } from 'node:events';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

/**
 * Crea un id único para cada mensaje.
 * @returns {string}
 */
export function generarId() {
    return `m-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

/**
 * Lee el body de una petición HTTP como string.
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<string>}
 */
function leerBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => (data += chunk));
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

/**
 * Parsea los argumentos de la línea de comandos.
 * @param {string[]} argv
 * @returns {{ nombre: string, puerto: number }}
 */
export function parsearArgumentos(argv) {
    let nombre = 'invitado';
    let puerto = 3000;

    const indiceNombre = argv.indexOf('--nombre');
    const indicePuerto = argv.indexOf('--puerto');

    if (indiceNombre !== -1 && argv[indiceNombre + 1]) {
        nombre = argv[indiceNombre + 1];
    }

    if (indicePuerto !== -1 && argv[indicePuerto + 1]) {
        puerto = Number(argv[indicePuerto + 1]);
    }

    return {
        nombre,
        puerto
    };
}

/**
 * Construye la configuración de la aplicación usando variables de entorno.
 * @param {NodeJS.ProcessEnv} env
 * @returns {{ puerto: number, nombreApp: string, archivoDatos: string }}
 */
export function obtenerConfig(env) {
    return {
        puerto: env.PORT ? Number(env.PORT) : 3000,
        nombreApp: env.NOMBRE_APP || 'mensajes-api',
        archivoDatos: env.ARCHIVO_DATOS || 'data/mensajes.json'
    };
}

/**
 * Devuelve información del sistema.
 * @returns {{ plataforma: string, nucleos: number, memoriaLibreMB: number, hostname: string }}
 */
export function infoSistema() {
    return {
        plataforma: os.platform(),
        nucleos: os.cpus().length,
        memoriaLibreMB: Math.round(os.freemem() / 1024 / 1024),
        hostname: os.hostname()
    };
}

/**
 * Crea un logger basado en EventEmitter.
 * @returns {{
 * registrar: (mensaje: string) => void,
 * onRegistro: (fn: (linea: string) => void) => void
 * }}
 */
export function crearLogger() {
    const emisor = new EventEmitter();

    function registrar(mensaje) {
        const linea = `[${new Date().toISOString()}] ${mensaje}`;
        emisor.emit('registro', linea);
    }

    function onRegistro(fn) {
        emisor.on('registro', fn);
    }

    return {
        registrar,
        onRegistro
    };
}

/**
 * Lee el arreglo de mensajes desde un archivo JSON.
 * Si no existe, contiene JSON inválido o no contiene un arreglo,
 * devuelve un arreglo vacío.
 *
 * @param {string} archivoDatos
 * @returns {Promise<Array<{id: string, texto: string, fecha: string}>>}
 */
export async function leerMensajes(archivoDatos) {
    try {
        const contenido = await fs.readFile(archivoDatos, 'utf8');
        const datos = JSON.parse(contenido);

        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            return [];
        }

        throw error;
    }
}

/**
 * Agrega un mensaje al archivo y devuelve el mensaje creado.
 * Si el texto está vacío devuelve null.
 *
 * @param {string} archivoDatos
 * @param {string} texto
 * @returns {Promise<{id: string, texto: string, fecha: string} | null>}
 */
export async function agregarMensaje(archivoDatos, texto) {
    const textoLimpio = typeof texto === 'string' ? texto.trim() : '';

    if (textoLimpio === '') {
        return null;
    }

    const mensajes = await leerMensajes(archivoDatos);

    const nuevoMensaje = {
        id: generarId(),
        texto: textoLimpio,
        fecha: new Date().toISOString()
    };

    mensajes.push(nuevoMensaje);

    const directorio = path.dirname(archivoDatos);

    await fs.mkdir(directorio, {
        recursive: true
    });

    await fs.writeFile(
        archivoDatos,
        JSON.stringify(mensajes, null, 2),
        'utf8'
    );

    return nuevoMensaje;
}

/**
 * Crea un servidor HTTP con las rutas de la API.
 *
 * @param {{
 * archivoDatos?: string,
 * nombreApp?: string,
 * logger?: ReturnType<typeof crearLogger>
 * }} [config]
 * @returns {import('node:http').Server}
 */
export function crearServidor(config = {}) {
    throw new Error('Not implemented: crearServidor');
}

/**
 * Crea y arranca el servidor.
 *
 * @param {{
 * puerto?: number,
 * archivoDatos?: string,
 * nombreApp?: string,
 * logger?: ReturnType<typeof crearLogger>
 * }} [config]
 * @returns {import('node:http').Server}
 */
export function iniciarServidor(config = {}) {
    throw new Error('Not implemented: iniciarServidor');
}