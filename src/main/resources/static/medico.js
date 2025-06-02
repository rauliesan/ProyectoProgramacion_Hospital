// Funciones para manejar los modales
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        
        // Si es el modal de añadir, cargar las especialidades
        if (modalId === 'aniadir-medico') {
            cargarEspecialidades();
        }
    }
}

function closeAllModals() {
    // Cerrar todos los modales
    let modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Limpiar los campos del formulario de añadir médico
    if (document.getElementById('medico-nombre')) {
        document.getElementById('medico-nombre').value = '';
    }
    if (document.getElementById('medico-apellidos')) {
        document.getElementById('medico-apellidos').value = '';
    }
    if (document.getElementById('medico-dni')) {
        document.getElementById('medico-dni').value = '';
    }
    if (document.getElementById('medico-num-colegiado')) {
        document.getElementById('medico-num-colegiado').value = '';
    }
    // No limpiamos el select de especialidad porque se recarga cada vez
}

// Cerrar modales cuando se hace clic fuera de ellos
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Cerrar desplegables de especialidades cuando se hace clic en cualquier parte
document.addEventListener('click', function(event) {
    // Si no se hace clic en un desplegable de especialidades, cerrar todos
    if (!event.target.closest('.especialidades-dropdown')) {
        const dropdowns = document.querySelectorAll('.especialidades-dropdown-content');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }
});

// Cargar datos cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la tabla con un mensaje
    document.getElementById("consulta-medicos").innerHTML = "<tr><td colspan='7' style='text-align:center'>Ingrese criterios de búsqueda</td></tr>";
	
});

// Función para cargar especialidades en los selectores
function cargarEspecialidades() {
    fetch('http://localhost:9999/buscar_especialidades?nombre=')
        .then(res => res.text())
        .then(json => {
            const especialidades = JSON.parse(json);
            
            // Selector para el formulario de añadir
            let selectorAñadir = document.getElementById('medico-especialidad');
            selectorAñadir.innerHTML = '<option value="">Seleccione una especialidad</option>';
            
            if (especialidades.length > 0) {
                especialidades.forEach(especialidad => {
                    // Añadir opciones al selector de añadir
                    let optionAñadir = document.createElement('option');
                    optionAñadir.value = especialidad.id;
                    optionAñadir.textContent = especialidad.nombre;
                    selectorAñadir.appendChild(optionAñadir);
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar especialidades:', error);
        });
}

// Función para buscar médicos
function buscarMedicos() {
    let nombre = document.getElementById('buscar-medico-nombre').value;
    let dni = document.getElementById('buscar-medico-dni').value;
    
    fetch('http://localhost:9999/buscar_medicos?nombre='+nombre+'&dni='+dni)
        .then(res => res.text())
        .then(json => {
            const data = JSON.parse(json);
            let medicos = data;
            let tabla = "";
            
            if (medicos.length > 0) {
                medicos.forEach(fila => {
                    // Para depuración
                    console.log('Datos del médico:', fila);
                    
                    tabla += "<tr>";
                    tabla += "<td>" + fila.id + "</td>";
                    tabla += "<td>" + fila.nombre + "</td>";
                    
                    // Corregimos el mapeo de campos
                    tabla += "<td>" + fila.apellidos + "</td>";  // Apellidos en la columna de apellidos
                    tabla += "<td>" + fila.dni + "</td>";        // DNI en la columna de DNI
                    tabla += "<td>" + fila.numColegiado + "</td>"; // Nº Colegiado en su columna
                    
                    // Columna de especialidades con ambos botones
                    tabla += "<td>";
                    tabla += "<div class='especialidades-container'>";
                    tabla += "<div class='especialidades-dropdown'>";
                    tabla += "<button class='especialidades-btn' onclick='toggleEspecialidadesDropdown(" + fila.id + ")'>Ver especialidades</button>";
                    tabla += "<div id='dropdown-" + fila.id + "' class='especialidades-dropdown-content'>";
                    tabla += "<div id='especialidades-lista-" + fila.id + "'></div>";
                    tabla += "</div></div>";
                    tabla += "<button class='btn-action edit' onclick='prepararAnadirEspecialidad(" + fila.id + ")'><i class='fas fa-plus'></i></button>";
                    tabla += "</div></td>";
                    
                    // También corregimos los parámetros en la función de edición - eliminamos idEspecialidad
                    tabla += "<td><button class=\"btn-action edit\" onclick=\"llamarActualizarMedico('" + fila.id + "', '" + fila.nombre + "', '" + fila.apellidos + "', '" + fila.dni + "', '" + fila.numColegiado + "')\"><i class=\"fas fa-edit\"></i></button>";
                    tabla += "<button class=\"btn-action delete\" onclick=\"prepararEliminar(" + fila.id + ")\"><i class=\"fas fa-trash\"></i></button></td>";
                    tabla += "</tr>";
                });
            } else {
                tabla = "<tr><td colspan='7' style='text-align:center'>No se encontraron registros</td></tr>";
            }
                
            document.getElementById("consulta-medicos").innerHTML = tabla;
        })
        .catch(e => {
            console.log('Error importando archivo: ' + e.message);
            document.getElementById("consulta-medicos").innerHTML = "<tr><td colspan='7' style='text-align:center'>Error de conexión con el servidor</td></tr>";
        });
}

// Función para mostrar/ocultar el desplegable de especialidades
function toggleEspecialidadesDropdown(medicoId) {
    const dropdown = document.getElementById('dropdown-' + medicoId);
    
    // Cerrar todos los otros desplegables
    const dropdowns = document.querySelectorAll('.especialidades-dropdown-content');
    dropdowns.forEach(d => {
        if (d.id !== 'dropdown-' + medicoId) {
            d.style.display = 'none';
        }
    });
    
    // Mostrar u ocultar el desplegable actual
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
        cargarEspecialidadesMedico(medicoId);
    }
    
    // Evitar que el evento se propague
    event.stopPropagation();
}

// Función modificada para cargar las especialidades de un médico con botón para eliminar
function cargarEspecialidadesMedico(medicoId) {
    fetch('http://localhost:9999/buscar_especialidades_medico?idMedico='+medicoId)
        .then(res => res.text())
        .then(json => {
            const especialidades = JSON.parse(json);
            let listaHTML = "";
            
            if (especialidades.length > 0) {
                listaHTML = "<ul class='especialidades-lista'>";
                especialidades.forEach(esp => {
                    listaHTML += "<li class='especialidad-item'>" + 
                                  "<span>" + esp.nombre + "</span>" +
                                  "<button class='btn-action delete btn-eliminar-especialidad' " +
                                  "onclick='eliminarEspecialidadMedico(" + medicoId + ", " + esp.id + ")'>" +
                                  "<i class='fas fa-trash'></i></button>" +
                                  "</li>";
                });
                listaHTML += "</ul>";
            } else {
                listaHTML = "<p>Este médico no tiene especialidades asignadas</p>";
            }
            
            document.getElementById('especialidades-lista-' + medicoId).innerHTML = listaHTML;
        })
        .catch(error => {
            console.error('Error al cargar especialidades del médico:', error);
            document.getElementById('especialidades-lista-' + medicoId).innerHTML = "<p>Error al cargar especialidades</p>";
        });
}

// Función para preparar la adición de especialidad a un médico
function prepararAnadirEspecialidad(medicoId) {
    document.getElementById('medico-id-especialidad').value = medicoId;
    
    // Cargar las especialidades disponibles
    fetch('http://localhost:9999/buscar_especialidades?nombre=')
        .then(res => res.text())
        .then(json => {
            const especialidades = JSON.parse(json);
            
            let selectorEspecialidad = document.getElementById('nueva-especialidad');
            selectorEspecialidad.innerHTML = '<option value="">Seleccione una especialidad</option>';
            
            if (especialidades.length > 0) {
                // Primero obtener las especialidades que ya tiene el médico para filtrarlas
                fetch('http://localhost:9999/buscar_especialidades_medico?idMedico='+medicoId)
                    .then(res => res.text())
                    .then(jsonEsp => {
                        const especialidadesMedico = JSON.parse(jsonEsp);
                        // Crear array de IDs de especialidades que ya tiene el médico
                        const idsEspecialidadesMedico = especialidadesMedico.map(esp => esp.id);
                        
                        // Filtrar las especialidades que no tiene asignadas
                        especialidades.forEach(especialidad => {
                            if (!idsEspecialidadesMedico.includes(especialidad.id)) {
                                let option = document.createElement('option');
                                option.value = especialidad.id;
                                option.textContent = especialidad.nombre;
                                selectorEspecialidad.appendChild(option);
                            }
                        });
                        
                        // Abrir el modal
                        openModal('aniadir-especialidad-medico');
                    });
            } else {
                alert('No hay especialidades disponibles');
            }
        })
        .catch(error => {
            console.error('Error al cargar especialidades:', error);
            alert('Error al cargar especialidades. Por favor, inténtelo de nuevo.');
        });
}

// Función para guardar la nueva especialidad del médico
function guardarEspecialidadMedico() {
    let medicoId = document.getElementById('medico-id-especialidad').value;
    let especialidadId = document.getElementById('nueva-especialidad').value;
    
    if (!especialidadId) {
        alert('Debe seleccionar una especialidad');
        return;
    }
    
    fetch('http://localhost:9999/asignar_especialidad_medico?idMedico='+medicoId+'&idEspecialidad='+especialidadId)
        .then(res => res.text())
        .then(json => {
            // Actualizar las especialidades si el desplegable está abierto
            const dropdown = document.getElementById('dropdown-' + medicoId);
            if (dropdown && dropdown.style.display === 'block') {
                cargarEspecialidadesMedico(medicoId);
            }
        })
        .catch(error => {
            console.error('Error al asignar especialidad al médico:', error);
            alert('Error al asignar la especialidad. Por favor, inténtelo de nuevo.');
        });
    
    // Cerrar el modal
    closeAllModals();
}

// Variables para almacenar los IDs para eliminar especialidades
let especialidadIdAEliminar = null;
let medicoIdEspecialidadAEliminar = null;

// Función modificada para preparar la eliminación de la especialidad
function eliminarEspecialidadMedico(medicoId, especialidadId) {
    // En lugar de mostrar una alerta, preparamos los datos y abrimos el modal
    medicoIdEspecialidadAEliminar = medicoId;
    especialidadIdAEliminar = especialidadId;
    openModal('modal-confirm-especialidad');
    
    // Evitar que el evento se propague y cierre el desplegable
    event.stopPropagation();
}

// Función para confirmar eliminación de especialidad del médico
function confirmarEliminarEspecialidad() {
    if (medicoIdEspecialidadAEliminar && especialidadIdAEliminar) {
        fetch('http://localhost:9999/eliminar_especialidad_medico?idMedico='+medicoIdEspecialidadAEliminar+'&idEspecialidad='+especialidadIdAEliminar)
            .then(res => res.text())
            .then(json => {
                // Recargar las especialidades del médico
                cargarEspecialidadesMedico(medicoIdEspecialidadAEliminar);
                
                // Reiniciar las variables
                medicoIdEspecialidadAEliminar = null;
                especialidadIdAEliminar = null;
            })
            .catch(error => {
                console.error('Error al eliminar especialidad del médico:', error);
                alert('Error al eliminar la especialidad. Por favor, inténtelo de nuevo.');
            });
    }
    
    // Cerrar el modal
    closeAllModals();
}

// Función para guardar un nuevo médico
function guardarMedico() {
    // Obtener los valores de los campos
    let nombre = document.getElementById('medico-nombre').value;
    let apellidos = document.getElementById('medico-apellidos').value;
    let dni = document.getElementById('medico-dni').value;
    let numColegiado = document.getElementById('medico-num-colegiado').value;
    let especialidad = document.getElementById('medico-especialidad').value;
    
    // Validaciones básicas
    if (!nombre.trim()) {
        alert('El nombre no puede estar vacío');
        return;
    }
    
    if (!apellidos.trim()) {
        alert('Los apellidos no pueden estar vacíos');
        return;
    }
    
    if (!dni.trim()) {
        alert('El DNI no puede estar vacío');
        return;
    }
    
    if (!numColegiado.trim()) {
        alert('El número de colegiado no puede estar vacío');
        return;
    }
    
    if (!especialidad.trim()) {
        alert('No se ha seleccionado ninguna especialidad');
        return;
    }
    
    
    fetch('http://localhost:9999/crear_medicos?nombre='+nombre+'&apellidos='+apellidos+'&dni='+dni+'&numColegiado='+numColegiado+'&idEspecialidad='+especialidad)
        .then(res => res.text())
        .then(json => {
            buscarMedicos(); // Refrescar la tabla después de guardar
        })
        .catch(error => {
            console.error('Error al guardar médico:', error);
            alert('Error al guardar el médico. Por favor, inténtelo de nuevo.');
        });
    
    // Cerrar el modal
    closeAllModals();
}

function llamarActualizarMedico(id, nombre, apellidos, dni, numColegiado) {
    document.getElementById('editar-medico-id').value = id;
    document.getElementById('editar-medico-nombre').value = nombre;
    document.getElementById('editar-medico-apellidos').value = apellidos;
    document.getElementById('editar-medico-dni').value = dni;
    document.getElementById('editar-medico-num-colegiado').value = numColegiado;
    
    // Abrimos el modal
    openModal('editar-medico');
}

// Función para actualizar un médico
function actualizarMedico() {
    // Obtener los valores de los campos
    let id = document.getElementById('editar-medico-id').value;
    let nombre = document.getElementById('editar-medico-nombre').value;
    let apellidos = document.getElementById('editar-medico-apellidos').value;
    let dni = document.getElementById('editar-medico-dni').value;
    let numColegiado = document.getElementById('editar-medico-num-colegiado').value;
    
    // Validaciones básicas
    if (!nombre.trim()) {
        alert('El nombre no puede estar vacío');
        return;
    }
    
    if (!apellidos.trim()) {
        alert('Los apellidos no pueden estar vacíos');
        return;
    }
    
    if (!dni.trim()) {
        alert('El DNI no puede estar vacío');
        return;
    }
    
    if (!numColegiado.trim()) {
        alert('El número de colegiado no puede estar vacío');
        return;
    }
    
    fetch('http://localhost:9999/modificar_medicos?id='+id+'&nombre='+nombre+'&apellidos='+apellidos+'&dni='+dni+'&numColegiado='+numColegiado)
        .then(res => res.text())
        .then(json => {
            buscarMedicos(); // Refrescar la tabla después de actualizar
        })
        .catch(error => {
            console.error('Error al actualizar médico:', error);
            alert('Error al actualizar el médico. Por favor, inténtelo de nuevo.');
        });
    
    // Cerrar el modal
    closeAllModals();
}

// Variable para almacenar el ID del médico a eliminar
let medicoIdAEliminar = null;

// Función para preparar la eliminación
function prepararEliminar(id) {
    medicoIdAEliminar = id;
    openModal('modal-confirm');
}

// Función para confirmar eliminación
function confirmarEliminar() {
    if (medicoIdAEliminar) {
        fetch('http://localhost:9999/eliminar_medico?idMedico='+medicoIdAEliminar)
            .then(res => res.text())
            .then(json => {
                buscarMedicos(); // Refrescar la tabla después de eliminar
                medicoIdAEliminar = null;
            })
            .catch(error => {
                console.error('Error al eliminar médico:', error);
                alert('Error al eliminar el médico. Por favor, inténtelo de nuevo.');
            });
    }
    
    // Cerrar el modal
    closeAllModals();
}