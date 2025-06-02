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
    
    // Limpiar los campos del formulario de editar historial
    if (document.getElementById('editar-historial-descripcion')) {
        document.getElementById('editar-historial-descripcion').value = '';
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
    document.getElementById("consulta-historiales").innerHTML = "<tr><td colspan='6' style='text-align:center'>Ingrese criterios de búsqueda</td></tr>";
});

// Función para buscar historiales
function buscarHistoriales() {
  let dni = document.getElementById('buscar-historial-dni').value || '';

  fetch('http://localhost:9999/consulta_historiales?dni='+dni)
    .then(res => res.text())
    .then(json => {
      const historiales = JSON.parse(json);  // Aquí se parsea directamente el JSON
      let tabla = "";

      if (historiales.length > 0) {
        historiales.forEach(fila => {
          tabla += "<tr>";
          tabla += "<td>" + fila.id + "</td>";
          tabla += "<td>" + fila.idPaciente + "</td>";
          tabla += "<td>" + fila.dni + "</td>";
          tabla += "<td>" + fila.descripcion + "</td>";
          tabla += "<td>" + fila.fechaCreacion + "</td>";
          tabla += "<td><button class=\"btn-action edit\" onclick=\"llamarActualizarHistorial('" + fila.id + "', '" + fila.idPaciente + "', '" + fila.dni + "', '" + fila.descripcion + "', '" + fila.fechaCreacion + "')\"><i class=\"fas fa-edit\"></i></button>";
		  tabla += "<button class=\"btn-action view\" title=\"Ver Citas\" onclick=\"mostrarCitasPaciente('" + fila.idPaciente + "')\">" + "<i class=\"fas fa-eye\"></i></button></td>";
		  tabla += "</tr>";
        });
      } else {
        tabla = "<tr><td colspan='6' style='text-align:center'>No se encontraron registros</td></tr>";
      }

      document.getElementById("consulta-historiales").innerHTML = tabla;
    });
}

function llamarActualizarHistorial(id, idPaciente, dni, descripcion, fechaCreacion) {
    document.getElementById('editar-historial-id').value = id;
    document.getElementById('editar-historial-id-paciente').value = idPaciente;
    document.getElementById('editar-historial-dni').value = dni;
    document.getElementById('editar-historial-descripcion').value = descripcion;
    document.getElementById('editar-historial-fecha').value = fechaCreacion;
    
    openModal('editar-historial');
}

// Función para actualizar un historial
function actualizarHistorial() {
    // Obtener los valores de los campos
    let id = document.getElementById('editar-historial-id').value;
    let descripcion = document.getElementById('editar-historial-descripcion').value;
    let fechaCreacion = document.getElementById('editar-historial-fecha').value;
    
    // Validaciones básicas
    if (!descripcion.trim()) {
        alert('La descripción no puede estar vacía');
        return;
    }
    
    if (!fechaCreacion) {
        alert('La fecha de creación es obligatoria');
        return;
    }
    
    fetch(`http://localhost:9999/modificar_historiales?id=${id}&descripcion=${encodeURIComponent(descripcion)}&fechaCreacion=${fechaCreacion}`)
        .then(res => res.text())
        .then(json => {
            buscarHistoriales(); // Refrescar la tabla después de actualizar
        })
        .catch(error => {
            console.error('Error al actualizar historial:', error);
            alert('Error al actualizar el historial. Por favor, inténtelo de nuevo.');
        });
    
    // Cerrar el modal
    closeAllModals();
}

// Función para obtener y mostrar las citas de un paciente específico
function mostrarCitasPaciente(idPaciente) {
    const tbody = document.getElementById('tbody-citas-paciente');
	
    // 1. Preparar UI: Mostrar carga y abrir modal
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Cargando citas...</td></tr>';
    openModal('modal-citas-paciente'); // Abre el modal específico
	
    const url = 'http://localhost:9999/buscar_citas_paciente?idPaciente='+idPaciente; // <-- URL de la segunda función
    console.log("Fetching citas from:", url);

    fetch(url)
        .then(res => {
            if (!res.ok) {
                // Intenta obtener un mensaje de error del cuerpo si es posible
                return res.text().then(text => {
                   throw new Error(`Error ${res.status}: ${text || res.statusText}`);
                });
            }
            return res.text(); // Obtener respuesta como texto primero
        })
        .then(text => { // 4. Parsear JSON
            try {
                const citas = JSON.parse(text); // Parsea el texto como JSON
                console.log("Citas recibidas:", citas);
                return citas; // Pasa el array de citas al siguiente .then
            } catch (e) {
                console.error("Error parsing JSON:", e, "Response text:", text);
                throw new Error("Respuesta del servidor no es JSON válido.");
            }
        })
        .then(citas => { // 5. Procesar y mostrar datos (lógica original del .then de mostrarCitasPaciente)
            let tablaCitasHTML = "";
            if (citas && citas.length > 0) {
                citas.forEach(cita => {
                    // Determinar clase de estado
                    let estadoClass = '';
                    switch(cita.estado) {
                        case 'Pendiente': estadoClass = 'estado-pendiente'; break;
                        case 'Confirmada': estadoClass = 'estado-confirmada'; break;
                        case 'Cancelada': estadoClass = 'estado-cancelada'; break;
                        case 'Realizada': estadoClass = 'estado-realizada'; break;
                        default: estadoClass = '';
                    }

                    // Formatear fecha y hora
                    let fechaHoraFormateada = "Fecha inválida";
                    if (cita.fechaHora) {
                        try {
                            const fechaHora = new Date(cita.fechaHora);
                            if (!isNaN(fechaHora)) { // Comprobar si la fecha es válida
                                const fechaFormateada = fechaHora.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
                                const horaFormateada = fechaHora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                fechaHoraFormateada = fechaFormateada + " " + horaFormateada;
                            }
                        } catch (e) {
                            console.error("Error formateando fecha: ", cita.fechaHora, e);
                        }
                    }

                    // Construir HTML de la fila
                    tablaCitasHTML += "<tr>";
                    tablaCitasHTML += "<td>" + (cita.id || 'N/A') + "</td>";
                    tablaCitasHTML += "<td>" + (cita.nombreMedico || 'N/A') + " " + (cita.apellidosMedico || '') + "</td>";
                    tablaCitasHTML += "<td>" + (cita.codigo || '') + "</td>";
                    tablaCitasHTML += "<td style='max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' title='" + (cita.descripcion || '').replace(/"/g, '"') + "'>" + (cita.descripcion || '') + "</td>";
                    tablaCitasHTML += "<td>" + fechaHoraFormateada + "</td>";
                    tablaCitasHTML += "<td><span class='" + estadoClass + "'>" + (cita.estado || 'N/A') + "</span></td>";
                    tablaCitasHTML += "</tr>";
                });
            } else {
                tablaCitasHTML = "<tr><td colspan='6' style='text-align:center'>No se encontraron citas para este paciente.</td></tr>";
            }
            tbody.innerHTML = tablaCitasHTML; // Actualizar el cuerpo de la tabla en el modal
        })
        .catch(error => { // 6. Manejar errores de cualquier paso anterior
            console.error('Error al cargar o procesar citas del paciente:', error);
            tbody.innerHTML = "<tr><td colspan='6' style='text-align:center'>Error al cargar las citas: " + error.message + "</td></tr>";
        });
}