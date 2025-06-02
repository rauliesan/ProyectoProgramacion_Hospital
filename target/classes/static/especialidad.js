// Funciones para manejar los modales
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAllModals() {
    // Cerrar todos los modales
    let modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Limpiar los campos del formulario
    if (document.getElementById('especialidad-nombre')) {
        document.getElementById('especialidad-nombre').value = '';
    }
    if (document.getElementById('especialidad-descripcion')) {
        document.getElementById('especialidad-descripcion').value = '';
    }
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

// Cargar datos cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la tabla con un mensaje
    document.getElementById("consulta-especialidades").innerHTML = "<tr><td colspan='4' style='text-align:center'>Ingrese criterios de búsqueda</td></tr>";
    
    // Opcional: cargar todas las especialidades al inicio
    buscarEspecialidades();
});

// Función para buscar especialidades
function buscarEspecialidades() {
    let nombre = document.getElementById('buscar-especialidad-nombre').value;
    
    fetch('http://localhost:9999/buscar_especialidades?nombre=' + nombre)
        .then(res => res.text())
        .then(json => {
            const data = JSON.parse(json);  // Aquí estás parseando el JSON de la respuesta
            let especialidades = data;  // Asignamos los datos a la variable especialidades
            let tabla = "";
			
            if (especialidades.length > 0) {
                especialidades.forEach(fila => {
                    tabla += "<tr>";
                    tabla += "<td>" + fila.id + "</td>";
                    tabla += "<td>" + fila.nombre + "</td>";
                    tabla += "<td>" + fila.descripcion + "</td>";
                    tabla += "<td><button class=\"btn-action edit\" onclick=\"llamarActualizarEspecialidad('" + fila.id + "', '" + fila.nombre + "', '" + fila.descripcion + "')\"><i class=\"fas fa-edit\"></i></button>";
                    tabla += "<button class=\"btn-action delete\" onclick=\"prepararEliminar(" + fila.id + ")\"><i class=\"fas fa-trash\"></i></button></td>";
					tabla += "</tr>";
                });
            } else {
                tabla = "<tr><td colspan='4' style='text-align:center'>No se encontraron registros</td></tr>";
            }
                
            document.getElementById("consulta-especialidades").innerHTML = tabla;
        })
        .catch(e => {
            console.log('Error importando archivo: ' + e.message);
            document.getElementById("consulta-especialidades").innerHTML = "<tr><td colspan='4' style='text-align:center'>Error de conexión con el servidor</td></tr>";
        });
}


// Función para guardar una nueva especialidad
function guardarEspecialidad() {
    // Obtener los valores de los campos
    let nombre = document.getElementById('especialidad-nombre').value;
    let descripcion = document.getElementById('especialidad-descripcion').value;
    
    // Validaciones básicas
    if (!nombre.trim()) {
        alert('El nombre no puede estar vacío');
        return;
    }
    
    fetch('http://localhost:9999/crear_especialidades?nombre='+nombre+'&descripcion='+descripcion)
        .then(res => res.text())
        .then(json => {
            buscarEspecialidades(); // Refrescar la tabla después de guardar
        })
        .catch(error => {
            console.error('Error al guardar especialidad:', error);
            alert('Error al guardar la especialidad. Por favor, inténtelo de nuevo.');
        });
    
    // Cerrar el modal
    closeAllModals();
}

function llamarActualizarEspecialidad(id, nombre, descripcion) {
    document.getElementById('editar-especialidad-id').value = id;
    document.getElementById('editar-especialidad-nombre').value = nombre;
    document.getElementById('editar-especialidad-descripcion').value = descripcion;
    
    openModal('editar-especialidad');
}

// Función para actualizar una especialidad
function actualizarEspecialidad() {
    // Obtener los valores de los campos
    let id = document.getElementById('editar-especialidad-id').value;
    let nombre = document.getElementById('editar-especialidad-nombre').value;
    let descripcion = document.getElementById('editar-especialidad-descripcion').value;
    
    // Validaciones básicas
    if (!nombre.trim()) {
        alert('El nombre no puede estar vacío');
        return;
    }
    
    fetch('http://localhost:9999/modificar_especialidades?id='+id+'&nombre='+nombre+'&descripcion='+descripcion)
        .then(res => res.text())
        .then(json => {
            buscarEspecialidades(); // Refrescar la tabla después de actualizar
        })
        .catch(error => {
            console.error('Error al actualizar especialidad:', error);
            alert('Error al actualizar la especialidad. Por favor, inténtelo de nuevo.');
        });
    
    // Cerrar el modal
    closeAllModals();
}

// Variable para almacenar el ID de la especialidad a eliminar
let especialidadIdAEliminar = null;

// Función para preparar la eliminación
function prepararEliminar(id) {
    especialidadIdAEliminar = id;
    openModal('modal-confirm');
}

// Función para confirmar eliminación
function confirmarEliminar() {
    if (especialidadIdAEliminar) {
        fetch('http://localhost:9999/eliminar_especialidades?id='+especialidadIdAEliminar)
            .then(res => res.text())
            .then(json => {
                buscarEspecialidades(); // Refrescar la tabla después de eliminar
                especialidadIdAEliminar = null;
            })
            .catch(error => {
                console.error('Error al eliminar especialidad:', error);
                alert('Error al eliminar la especialidad. Por favor, inténtelo de nuevo.');
            });
    }
    
    // Cerrar el modal
    closeAllModals();
}