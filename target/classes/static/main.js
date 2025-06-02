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
    
    // Limpiar solo los campos del formulario de añadir paciente
    if (document.getElementById('paciente-nombre')) {
        document.getElementById('paciente-nombre').value = '';
    }
    if (document.getElementById('paciente-apellidos')) {
        document.getElementById('paciente-apellidos').value = '';
    }
    if (document.getElementById('paciente-dni')) {
        document.getElementById('paciente-dni').value = '';
    }
	if (document.getElementById('paciente-direccion')) {
		document.getElementById('paciente-direccion').value = '';
	}
    if (document.getElementById('paciente-telefono')) {
        document.getElementById('paciente-telefono').value = '';
    }
    if (document.getElementById('paciente-fecha')) {
        document.getElementById('paciente-fecha').value = '';
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
	
	document.getElementById("consulta-pacientes").innerHTML = "<tr><td colspan='8' style='text-align:center'>Ingrese criterios de búsqueda</td></tr>";
    
});

// Función para guardar un nuevo paciente
function guardarPaciente() {
    // Obtener los valores de los campos
    let nombre = document.getElementById('paciente-nombre').value;
    let apellidos = document.getElementById('paciente-apellidos').value;
    let dni = document.getElementById('paciente-dni').value;
	let direccion = document.getElementById('paciente-direccion').value;
    let telefono = document.getElementById('paciente-telefono').value;
    let fechaNacimiento = document.getElementById('paciente-fecha').value;
	
    
    fetch("http://localhost:9999/crear_paciente?nombre="+nombre+"&apellidos="+apellidos+"&dni="+dni+"&direccion="+direccion+"&telefono="+telefono+"&fechaNacimiento="+fechaNacimiento)
        .then(res => res.text())
        .then(json => {
            buscarPaciente();
        })
        .catch(error => {
            console.error('Error al guardar paciente:', error);
        });
    
    // Cerrar el modal inmediatamente
    closeAllModals();
    console.log('Paciente añadido');
}

// Funciones de búsqueda
function buscarPaciente() {
    let nombre = document.getElementById('buscar-paciente-nombre').value;
    let dni = document.getElementById('buscar-paciente-dni').value;
    
    fetch("http://localhost:9999/consulta_pacientes?nombre="+nombre+"&dni="+dni)
        .then(res => res.text())
        .then(json => {
            const posts = JSON.parse(json);
            let tabla = "";            
            posts.forEach(fila => {
                tabla += "<tr>";
                tabla += "<td>"+fila.id+"</td>";
                tabla += "<td>"+fila.nombre+"</td>";
                tabla += "<td>"+fila.apellidos+"</td>";
                tabla += "<td>"+fila.dni+"</td>";
				tabla += "<td>"+fila.direccion+"</td>";
                tabla += "<td>"+fila.telefono+"</td>";
                tabla += "<td>"+fila.fechaNacimiento+"</td>";
                tabla += "<td><button class=\"btn-action edit\" onclick=\"llamarActualizarPaciente('"+fila.id+"', '"+fila.nombre+"', '"+fila.apellidos+"', '"+fila.dni+"', '"+fila.direccion+"', '"+fila.telefono+"', '"+fila.fechaNacimiento+"')\"><i class=\"fas fa-edit\"></i></button><button class=\"btn-action delete\" onclick=\"prepararEliminar("+fila.id+")\"><i class=\"fas fa-trash\"></i></button></td>";
                tabla += "</tr>";
            });
            var contenedor_tabla = document.getElementById("consulta-pacientes");
            contenedor_tabla.innerHTML = tabla;
        })
        .catch(e => {
            console.log('Error importando archivo: ' + e.message);
        });
}

function llamarActualizarPaciente(id, nombre, apellidos, dni, direccion, telefono, fechaNacimiento) {
    document.getElementById('editar-paciente-id').value = id;
    document.getElementById('editar-paciente-nombre').value = nombre;
    document.getElementById('editar-paciente-apellidos').value = apellidos;
    document.getElementById('editar-paciente-dni').value = dni;
	document.getElementById('editar-paciente-direccion').value = direccion;
	document.getElementById('editar-paciente-telefono').value = telefono;
	document.getElementById('editar-paciente-fecha').value = fechaNacimiento;
    
    openModal('editar-paciente');
}

// Función para actualizar un paciente
function actualizarPaciente() {
    // Obtener los valores de los campos
    let id = document.getElementById('editar-paciente-id').value;
    let nombre = document.getElementById('editar-paciente-nombre').value;
    let apellidos = document.getElementById('editar-paciente-apellidos').value;
    let dni = document.getElementById('editar-paciente-dni').value;
	let direccion = document.getElementById('editar-paciente-direccion').value;
    let telefono = document.getElementById('editar-paciente-telefono').value;
	let fechaNacimiento = document.getElementById('editar-paciente-fecha').value;
    
    
    fetch('http://localhost:9999/modificar_paciente?id='+id+'&nombre='+nombre+'&apellidos='+apellidos+'&dni='+dni+'&direccion='+direccion+'&telefono='+telefono+'&fechaNacimiento='+fechaNacimiento)
        .then(res => res.text())
        .then(json => {
            buscarPaciente();
        })
        .catch(error => {
            console.error('Error al actualizar paciente:', error);
        });
    
    // Cerrar el modal inmediatamente
    closeAllModals();
    console.log('Paciente actualizado');
}

// Variable para almacenar el ID del paciente a eliminar
let pacienteIdAEliminar = null;

// Función para abrir la eliminación de un paciente
function prepararEliminar(id) {
    pacienteIdAEliminar = id;
    openModal('modal-confirm');
}

// Función para confirmar eliminación
function confirmarEliminar() {
    if (pacienteIdAEliminar) {
        fetch('http://localhost:9999/eliminar_paciente?id='+pacienteIdAEliminar)
            .then(res => res.text())
            .then(json => {
                buscarPaciente();
                pacienteIdAEliminar = null;
            })
            .catch(error => {
                console.error('Error al eliminar paciente:', error);
            });
    }
    
    // Cerrar el modal inmediatamente
    closeAllModals();
}