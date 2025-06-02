// Funciones para manejar los modales
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        
        // Si es el modal de añadir o editar, cargar los pacientes y médicos
        if (modalId === 'aniadir-cita') {
            cargarPacientes('cita-paciente');
            cargarMedicos('cita-medico');
        } else if (modalId === 'editar-cita') {
            cargarPacientes('editar-cita-paciente');
            cargarMedicos('editar-cita-medico');
        }
    }
}

function closeAllModals() {
    // Cerrar todos los modales
    let modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Limpiar los campos del formulario de añadir cita
    if (document.getElementById('cita-codigo')) {
        document.getElementById('cita-codigo').value = '';
    }
    if (document.getElementById('cita-descripcion')) {
        document.getElementById('cita-descripcion').value = '';
    }
    if (document.getElementById('cita-fecha-hora')) {
        document.getElementById('cita-fecha-hora').value = '';
    }
    // Los selectores se recargarán cuando se abra el modal de nuevo
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
    document.getElementById("consulta-citas").innerHTML = "<tr><td colspan='8' style='text-align:center'>Ingrese criterios de búsqueda</td></tr>";
    
    // Agregar estilos para los estados de las citas
    const style = document.createElement('style');
    
    // Definir los estilos para los estados
	style.innerHTML = `
	    .estado-pendiente {
	        background-color: #4cc9f0;
	        color: white;
	        padding: 3px 8px;
	        border-radius: 12px;
	        font-size: 0.85rem;
	    }
	    .estado-confirmada {
	        background-color: #2ecc71;
	        color: white;
	        padding: 3px 8px;
	        border-radius: 12px;
	        font-size: 0.85rem;
	    }
	    .estado-cancelada {
	        background-color: #ff5a5f;
	        color: white;
	        padding: 3px 8px;
	        border-radius: 12px;
	        font-size: 0.85rem;
	    }
	    .estado-realizada {
	        background-color: #f39c12;
	        color: white;
	        padding: 3px 8px;
	        border-radius: 12px;
	        font-size: 0.85rem;
	    }
	`;
    
    // Añadir el estilo al head del documento
    document.head.appendChild(style);
});

// Función para cargar la lista de pacientes en un selector
function cargarPacientes(selectorId) {
    fetch('http://localhost:9999/consulta_pacientes?nombre=&dni=')
        .then(res => res.text())
        .then(json => {
            const pacientes = JSON.parse(json);
            let selector = document.getElementById(selectorId);
            selector.innerHTML = '<option value="">Seleccione un paciente</option>';
            
            if (pacientes.length > 0) {
                pacientes.forEach(paciente => {
                    let option = document.createElement('option');
                    option.value = paciente.id;
                    option.textContent = `${paciente.nombre} ${paciente.apellidos} (${paciente.dni})`;
                    selector.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar pacientes:', error);
        });
}

// Función para cargar la lista de médicos en un selector
function cargarMedicos(selectorId) {
    fetch('http://localhost:9999/buscar_medicos?nombre=&dni=')
        .then(res => res.text())
        .then(json => {
            const medicos = JSON.parse(json);
            let selector = document.getElementById(selectorId);
            selector.innerHTML = '<option value="">Seleccione un médico</option>';
            
            if (medicos.length > 0) {
                medicos.forEach(medico => {
                    let option = document.createElement('option');
                    option.value = medico.id;
                    option.textContent = `${medico.nombre} ${medico.apellidos} (${medico.dni})`;
                    selector.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar médicos:', error);
        });
}

// Función para buscar citas
function buscarCitas() {
    let codigo = document.getElementById('buscar-cita-codigo').value;
    let fecha = document.getElementById('buscar-cita-fecha').value;
    
    fetch('http://localhost:9999/buscar_citas?codigo='+codigo+'&fechaHora='+fecha)
        .then(res => res.text())
        .then(json => {
            const citas = JSON.parse(json);
            let tabla = "";
            
            if (citas.length > 0) {
                citas.forEach(cita => {
                    // Aplicar una clase según el estado
                    let estadoClass = '';
                    switch(cita.estado) {
                        case 'Pendiente':
                            estadoClass = 'estado-pendiente';
                            break;
                        case 'Confirmada':
                            estadoClass = 'estado-confirmada';
                            break;
                        case 'Cancelada':
                            estadoClass = 'estado-cancelada';
                            break;
                        case 'Realizada':
                            estadoClass = 'estado-realizada';
                            break;
                        default:
                            estadoClass = '';
                    }
                    
                    tabla += "<tr>";
                    tabla += "<td>" + cita.id + "</td>";
                    tabla += "<td>" + cita.nombrePaciente + " " + cita.apellidosPaciente + "</td>";
                    tabla += "<td>" + cita.nombreMedico + " " + cita.apellidosMedico + "</td>";
                    tabla += "<td>" + cita.codigo + "</td>";
                    tabla += "<td>" + cita.descripcion + "</td>";
                    
                    // Formatear fecha y hora para mostrar
                    const fechaHora = new Date(cita.fechaHora);
                    const fechaFormateada = fechaHora.toLocaleDateString('es-ES');
                    const horaFormateada = fechaHora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                    tabla += "<td>" + fechaFormateada + " " + horaFormateada + "</td>";
                    tabla += "<td><span class='" + estadoClass + "'>" + cita.estado + "</span></td>";
                    
                    tabla += "<td>" +
                             "<button class='btn-action edit' onclick='llamarActualizarCita(" + 
                             cita.id + ", \"" + 
                             cita.idPaciente + "\", \"" + 
                             cita.idMedico + "\", \"" + 
                             cita.codigo + "\", \"" + 
                             cita.descripcion + "\", \"" + 
                             cita.fechaHora + "\", \"" + 
                             cita.estado + "\")'><i class='fas fa-edit'></i></button>" +
                             "<button class='btn-action delete' onclick='prepararEliminar(" + cita.id + ")'>" +
                             "<i class='fas fa-trash'></i></button>" +
                             "</td>";
                    tabla += "</tr>";
                });
            } else {
                tabla = "<tr><td colspan='8' style='text-align:center'>No se encontraron citas</td></tr>";
            }
            
            document.getElementById("consulta-citas").innerHTML = tabla;
        })
        .catch(error => {
            console.error('Error al buscar citas:', error);
            document.getElementById("consulta-citas").innerHTML = "<tr><td colspan='8' style='text-align:center'>Error de conexión con el servidor</td></tr>";
        });
}

// Función para guardar una nueva cita
function guardarCita() {
    // Obtener los valores de los campos
    let idPaciente = document.getElementById('cita-paciente').value;
    let idMedico = document.getElementById('cita-medico').value;
    let codigo = document.getElementById('cita-codigo').value;
    let descripcion = document.getElementById('cita-descripcion').value;
    let fechaHora = document.getElementById('cita-fecha-hora').value;
    let estado = document.getElementById('cita-estado').value;
    
    // Validaciones básicas
    if (!idPaciente) {
        alert('Debe seleccionar un paciente');
        return;
    }
    
    if (!idMedico) {
        alert('Debe seleccionar un médico');
        return;
    }
    
    if (!codigo.trim()) {
        alert('El código no puede estar vacío');
        return;
    }
    
    if (!fechaHora) {
        alert('Debe seleccionar una fecha y hora para la cita');
        return;
    }
    
    fetch('http://localhost:9999/crear_citas?idPaciente='+idPaciente+'&idMedico='+idMedico+'&codigo='+codigo+'&descripcion='+descripcion+'&fechaHora='+fechaHora+'&estado='+estado)
        .then(res => res.text())
        .then(json => {
            buscarCitas();
        })
        .catch(error => {
            console.error('Error al guardar cita:', error);
            alert('Error al guardar la cita. Por favor, inténtelo de nuevo.');
        });
    
    // Cerrar el modal inmediatamente
    closeAllModals();
}

// Función para preparar actualización de cita
function llamarActualizarCita(id, idPaciente, idMedico, codigo, descripcion, fechaHora, estado) {
    document.getElementById('editar-cita-id').value = id;
    
    // Preparar los selectores
    cargarPacientes('editar-cita-paciente');
    cargarMedicos('editar-cita-medico');
    
    // Esperar a que los selectores se carguen antes de establecer los valores
    setTimeout(() => {
        document.getElementById('editar-cita-paciente').value = idPaciente;
        document.getElementById('editar-cita-medico').value = idMedico;
    }, 500);
    
    document.getElementById('editar-cita-codigo').value = codigo;
    document.getElementById('editar-cita-descripcion').value = descripcion;
    
    // Formatear la fecha para el input datetime-local
    if (fechaHora) {
        const fechaObj = new Date(fechaHora);
        const year = fechaObj.getFullYear();
        const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const day = String(fechaObj.getDate()).padStart(2, '0');
        const hours = String(fechaObj.getHours()).padStart(2, '0');
        const minutes = String(fechaObj.getMinutes()).padStart(2, '0');
        
        document.getElementById('editar-cita-fecha-hora').value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    document.getElementById('editar-cita-estado').value = estado;
    
    // Abrir el modal
    openModal('editar-cita');
}

// Función para actualizar una cita
function actualizarCita() {
    // Obtener los valores de los campos
    let id = document.getElementById('editar-cita-id').value;
    let idPaciente = document.getElementById('editar-cita-paciente').value;
    let idMedico = document.getElementById('editar-cita-medico').value;
    let codigo = document.getElementById('editar-cita-codigo').value;
    let descripcion = document.getElementById('editar-cita-descripcion').value;
    let fechaHora = document.getElementById('editar-cita-fecha-hora').value;
    let estado = document.getElementById('editar-cita-estado').value;
    
    // Validaciones básicas
    if (!idPaciente) {
        alert('Debe seleccionar un paciente');
        return;
    }
    
    if (!idMedico) {
        alert('Debe seleccionar un médico');
        return;
    }
    
    if (!codigo.trim()) {
        alert('El código no puede estar vacío');
        return;
    }
    
    if (!fechaHora) {
        alert('Debe seleccionar una fecha y hora para la cita');
        return;
    }
    
    fetch('http://localhost:9999/modificar_citas?id='+id+'&idPaciente='+idPaciente+'&idMedico='+idMedico+'&codigo='+codigo+'&descripcion='+descripcion+'&fechaHora='+fechaHora+'&estado='+estado)
        .then(res => res.text())
        .then(json => {
            buscarCitas();
        })
        .catch(error => {
            console.error('Error al actualizar cita:', error);
            alert('Error al actualizar la cita. Por favor, inténtelo de nuevo.');
        });
    
    // Cerrar el modal inmediatamente
    closeAllModals();
}

// Variable para almacenar el ID de la cita a eliminar
let citaIdAEliminar = null;

// Función para preparar eliminación
function prepararEliminar(id) {
    citaIdAEliminar = id;
    openModal('modal-confirm');
}

// Función para confirmar eliminación
function confirmarEliminar() {
    if (citaIdAEliminar) {
        fetch('http://localhost:9999/eliminar_cita?idCita='+citaIdAEliminar)
            .then(res => res.text())
            .then(json => {
                buscarCitas();
                citaIdAEliminar = null;
            })
            .catch(error => {
                console.error('Error al eliminar cita:', error);
                alert('Error al eliminar la cita. Por favor, inténtelo de nuevo.');
            });
    }
    
    // Cerrar el modal inmediatamente
    closeAllModals();
}