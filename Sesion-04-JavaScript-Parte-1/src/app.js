const STORAGE_KEY = "tareas-dw-s4";

let tareas = [];

export function obtenerTareas() {
    return tareas;
}

export function generarId() {
    return `t-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function agregarTarea(texto) {
    const textoLimpio = texto.trim();

    if (textoLimpio === "") {
        return null;
    }

    const tarea = {
        id: generarId(),
        texto: textoLimpio,
        completada: false
    };

    tareas.push(tarea);

    return tarea;
}

export function eliminarTarea(id) {
    const cantidadAnterior = tareas.length;

    tareas = tareas.filter((tarea) => tarea.id !== id);

    return tareas.length < cantidadAnterior;
}

export function toggleTarea(id) {
    const tarea = tareas.find((tarea) => tarea.id === id);

    if (!tarea) {
        return false;
    }

    tarea.completada = !tarea.completada;

    return true;
}

export function filtrarTareas(filtro) {
    if (filtro === "pendientes") {
        return tareas.filter((tarea) => !tarea.completada);
    }

    if (filtro === "completadas") {
        return tareas.filter((tarea) => tarea.completada);
    }

    return tareas;
}

export function guardar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

export function cargar() {
    try {
        const datos = localStorage.getItem(STORAGE_KEY);

        if (!datos) {
            tareas = [];
            return;
        }

        const tareasGuardadas = JSON.parse(datos);

        tareas = Array.isArray(tareasGuardadas)
            ? tareasGuardadas
            : [];
    } catch {
        tareas = [];
    }
}

export function render(filtro = "todas") {
    const lista = document.getElementById("lista-tareas");
    const contador = document.getElementById("contador");

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    const visibles = filtrarTareas(filtro);

    for (const tarea of visibles) {
        const li = document.createElement("li");

        if (tarea.completada) {
            li.classList.add("completada");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = tarea.completada;
        checkbox.dataset.id = tarea.id;
        checkbox.setAttribute(
            "aria-label",
            `Marcar "${tarea.texto}" como hecha`
        );

        checkbox.addEventListener("change", () => {
            toggleTarea(tarea.id);
            guardar();
            render(filtroActual);
        });

        const span = document.createElement("span");
        span.className = "texto";
        span.textContent = tarea.texto;

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "eliminar";
        btnEliminar.textContent = "✕";
        btnEliminar.setAttribute(
            "aria-label",
            `Eliminar "${tarea.texto}"`
        );

        btnEliminar.addEventListener("click", () => {
            eliminarTarea(tarea.id);
            guardar();
            render(filtroActual);
        });

        li.append(checkbox, span, btnEliminar);
        lista.appendChild(li);
    }

    if (contador) {
        const total = tareas.length;
        const hechas = tareas.filter((tarea) => tarea.completada).length;

        contador.textContent =
            `${total} tarea${total === 1 ? "" : "s"} (${hechas} hechas)`;
    }
}

let filtroActual = "todas";

function init() {
    cargar();
    render(filtroActual);

    const form = document.getElementById("form-tarea");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const input = document.getElementById("input-tarea");
            const creada = agregarTarea(input.value);

            if (creada) {
                guardar();
                render(filtroActual);
                input.value = "";
                input.focus();
            }
        });
    }

    const botonesFiltro = document.querySelectorAll(".filtro");

    botonesFiltro.forEach((btn) => {
        btn.addEventListener("click", () => {
            filtroActual = btn.dataset.filtro;

            botonesFiltro.forEach((b) => {
                b.classList.remove("activo");
            });

            btn.classList.add("activo");

            render(filtroActual);
        });
    });
}

if (
    typeof document !== "undefined" &&
    document.getElementById("lista-tareas")
) {
    document.addEventListener("DOMContentLoaded", init);
}