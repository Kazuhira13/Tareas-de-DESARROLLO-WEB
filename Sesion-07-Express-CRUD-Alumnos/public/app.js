/**
 * app.js — Lógica del sitio (Fetch + Dialogs)
 * Tarea Sesión 7 · Desarrollo Web · UMG
 *
 * TODO: implementa las funciones marcadas. La API exige el header
 * `x-api-key` en las operaciones de escritura (POST, PUT, DELETE).
 */

const API = '/alumnos';
const API_KEY = 'umg-2026'; // debe coincidir con config.env

// Helper ya resuelto: cabeceras para las peticiones
const cabeceras = (conJson = true) => ({
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': API_KEY,
});

// Referencias del DOM (ya resueltas)
const tabla = document.querySelector('#tablaAlumnos tbody');
const mensaje = document.querySelector('#mensaje');
const dialogoForm = document.querySelector('#dialogoForm');
const dialogoEliminar = document.querySelector('#dialogoEliminar');
const form = document.querySelector('#formAlumno');
const tituloForm = document.querySelector('#tituloForm');
const nombreEliminar = document.querySelector('#nombreEliminar');

let idEnEdicion = null;        // null = crear | string = editar
let idAEliminar = null;

/**
 * TODO: GET /alumnos y pinta las filas en la tabla.
 * Cada fila debe incluir botones "Editar" y "Eliminar".
 */
async function cargarAlumnos() {
    try {
        const respuesta = await fetch(API);

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar los alumnos');
        }

        const alumnos = await respuesta.json();

        tabla.innerHTML = '';

        alumnos.forEach((alumno, indice) => {
            const fila = document.createElement('tr');

            const datos = [
                indice + 1,
                alumno.nombre,
                alumno.apellido,
                alumno.email,
                alumno.edad ?? ''
            ];

            datos.forEach((dato) => {
                const celda = document.createElement('td');
                celda.textContent = dato;
                fila.appendChild(celda);
            });

            const celdaAcciones = document.createElement('td');

            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.textContent = 'Editar';
            btnEditar.addEventListener('click', () => {
                abrirDialogoEditar(alumno.id);
            });

            const btnEliminar = document.createElement('button');
            btnEliminar.type = 'button';
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.addEventListener('click', () => {
                eliminarAlumno(alumno.id);
            });

            celdaAcciones.appendChild(btnEditar);
            celdaAcciones.appendChild(btnEliminar);

            fila.appendChild(celdaAcciones);
            tabla.appendChild(fila);
        });

    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

/**
 * TODO: limpia el formulario, pone el título "Nuevo alumno",
 * idEnEdicion = null y abre dialogoForm con showModal().
 */
function abrirDialogoNuevo() {
    form.reset();
    idEnEdicion = null;
    tituloForm.textContent = 'Nuevo alumno';

    dialogoForm.showModal();
}

/**
 * TODO: precarga los datos del alumno en el formulario,
 * guarda su id en idEnEdicion, cambia el título a "Editar alumno"
 * y abre dialogoForm.
 */
async function abrirDialogoEditar(id) {
    try {
        const respuesta = await fetch(`${API}/${id}`);

        if (!respuesta.ok) {
            throw new Error('No se pudo cargar el alumno');
        }

        const alumno = await respuesta.json();

        document.querySelector('#nombre').value = alumno.nombre;
        document.querySelector('#apellido').value = alumno.apellido;
        document.querySelector('#email').value = alumno.email;
        document.querySelector('#edad').value = alumno.edad ?? '';

        idEnEdicion = alumno.id;
        tituloForm.textContent = 'Editar alumno';

        dialogoForm.showModal();

    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

/**
 * TODO: lee los campos del formulario y llama a la API.
 *   - Si idEnEdicion es null → POST /alumnos            (201)
 *   - Si hay id             → PUT /alumnos/:id          (200)
 * Usa cabeceras() y JSON.stringify(). Al terminar: cierra el dialog,
 * recarga la lista y muestra un mensaje.
 */
async function guardarAlumno(event) {
    event.preventDefault();

    const datos = {
    nombre: document.querySelector('#nombre').value.trim(),
    apellido: document.querySelector('#apellido').value.trim(),
    email: document.querySelector('#email').value.trim()
    };
    const edad = document.querySelector('#edad').value;

    if (edad !== '') {
        datos.edad = Number(edad);
    }

    const editando = idEnEdicion !== null;
    const metodo = editando ? 'PUT' : 'POST';
    const url = editando ? `${API}/${idEnEdicion}` : API;

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: cabeceras(),
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            const error = await respuesta.json();
            throw new Error(error.error || 'No se pudo guardar el alumno');
        }

        dialogoForm.close();
        await cargarAlumnos();

        mostrarMensaje(
            editando ? 'Alumno actualizado correctamente' : 'Alumno creado correctamente'
        );

    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

/**
 * TODO: abre dialogoEliminar guardando el id, y al confirmar hace
 * DELETE /alumnos/:id con cabeceras(false). Luego recarga y avisa.
 */
function eliminarAlumno(id) {
    idAEliminar = id;
    nombreEliminar.textContent = id;

    dialogoEliminar.showModal();
}

/**
 * TODO: helper para mostrar mensajes (error en rojo, éxito en verde).
 */
function mostrarMensaje(texto, tipo = 'ok') {
    mensaje.textContent = texto;
    mensaje.className = tipo;
}

// ============================================================
// Conexión de eventos (TODO: completa lo que falte)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#btnNuevo')
        .addEventListener('click', abrirDialogoNuevo);

    form.addEventListener('submit', guardarAlumno);

    document.querySelector('#btnCancelar')
        .addEventListener('click', () => {
            dialogoForm.close();
        });

    document.querySelector('#btnCancelarEliminar')
        .addEventListener('click', () => {
            dialogoEliminar.close();
            idAEliminar = null;
        });

    document.querySelector('#btnConfirmarEliminar')
        .addEventListener('click', async () => {
            if (idAEliminar === null) {
                return;
            }

            try {
                const respuesta = await fetch(`${API}/${idAEliminar}`, {
                    method: 'DELETE',
                    headers: cabeceras(false)
                });

                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    throw new Error(error.error || 'No se pudo eliminar el alumno');
                }

                dialogoEliminar.close();
                idAEliminar = null;

                await cargarAlumnos();
                mostrarMensaje('Alumno eliminado correctamente');

            } catch (error) {
                mostrarMensaje(error.message, 'error');
            }
        });

    cargarAlumnos();
});