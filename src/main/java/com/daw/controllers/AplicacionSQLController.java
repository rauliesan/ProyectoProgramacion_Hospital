package com.daw.controllers;

import java.sql.Date;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.daw.services.Servicio;

@RestController
public class AplicacionSQLController {
	
	@Autowired
	private Servicio servicio;
	
	@GetMapping("/consulta_pacientes")
	public ResponseEntity<?> buscarPacientes(@RequestParam String nombre, @RequestParam String dni){
		try {
			return ResponseEntity.ok().body(servicio.buscarPacientes(nombre, dni));
		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	
	@GetMapping("/crear_paciente")
	public ResponseEntity<?> crearPaciente(@RequestParam String nombre,
			@RequestParam String apellidos,
			@RequestParam String dni,
			@RequestParam String direccion,
			@RequestParam String telefono,
			@RequestParam Date fechaNacimiento){
		try {
			return ResponseEntity.ok().body(servicio.crearPaciente(nombre, apellidos, dni, direccion, telefono, fechaNacimiento));
		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage()); 
		}
	}
	
	@GetMapping("/modificar_paciente")
	public ResponseEntity<?> modificarPaciente(@RequestParam Long id,
			@RequestParam String nombre,
			@RequestParam String apellidos,
			@RequestParam String dni,
			@RequestParam String direccion,
			@RequestParam String telefono,
			@RequestParam Date fechaNacimiento){
		try {
			return ResponseEntity.ok().body(servicio.modificarPaciente(id, nombre, apellidos, dni, direccion, telefono, fechaNacimiento));
		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage()); 
		}
	}
	
	@GetMapping("/eliminar_paciente")
	public ResponseEntity<?> eliminarPaciente(@RequestParam Long id){
		try {
			servicio.eliminarPaciente(id);
			return ResponseEntity.ok().body("Eliminación Correcta");
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage()); 
		}
	}
	
	
	@GetMapping("/consulta_historiales")
	public ResponseEntity<?> buscarHistoriales(@RequestParam String dni){
		try {
			return ResponseEntity.ok().body(servicio.buscarHistoriales(dni));
		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	
	@GetMapping("/modificar_historiales")
	public ResponseEntity<?> modificarHistorial(@RequestParam Long id,
			@RequestParam String descripcion,
			@RequestParam Date fechaCreacion){
		try {
			return ResponseEntity.ok().body(servicio.modificarHistorial(id, descripcion, fechaCreacion));
		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	@GetMapping("/crear_especialidades")
	public ResponseEntity<?> crearEspecialidad(@RequestParam String nombre, @RequestParam String descripcion){
		try {
			return ResponseEntity.ok().body(servicio.crearEspecialidad(nombre, descripcion));
		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	
	@GetMapping("/buscar_especialidades")
	public ResponseEntity<?> buscarEspecialidades(@RequestParam String nombre){
		try {
			return ResponseEntity.ok().body(servicio.buscarEspecialidades(nombre));
		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	
	@GetMapping("/modificar_especialidades")
	public ResponseEntity<?> modificarEspecialidad(@RequestParam Long id, 
			@RequestParam String nombre,
			@RequestParam String descripcion){
		try {
			return ResponseEntity.ok().body(servicio.modificarEspecialidad(id, nombre, descripcion));
		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	@GetMapping("/eliminar_especialidades")
	public ResponseEntity<?> eliminarEspecialidad(@RequestParam Long id){
		try {
			servicio.eliminarEspecialidad(id);
			return ResponseEntity.ok().body("Eliminación Correcta");
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage()); 
		}
	}
	
	@GetMapping("/crear_medicos")
	public ResponseEntity<?> crearMedico(@RequestParam String nombre,
			@RequestParam String apellidos,
			@RequestParam String dni,
			@RequestParam String numColegiado,
			@RequestParam Long idEspecialidad){
		try {
			return ResponseEntity.ok().body(servicio.crearMedico(nombre, apellidos, dni, numColegiado, idEspecialidad));
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	@GetMapping("/buscar_medicos")
	public ResponseEntity<?> buscarMedicos(@RequestParam String nombre,
			@RequestParam String dni){
		try {
			return ResponseEntity.ok().body(servicio.buscarMedicos(nombre, dni));
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	
	@GetMapping("/modificar_medicos")
	public ResponseEntity<?> modificarMedico(@RequestParam Long id, 
			@RequestParam String nombre,
			@RequestParam String apellidos,
			@RequestParam String dni,
			@RequestParam String numColegiado){
		try {
			return ResponseEntity.ok().body(servicio.modificarMedico(id, nombre, apellidos, dni, numColegiado));
		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	
	@GetMapping("/buscar_especialidades_medico")
	public ResponseEntity<?> buscarEspecialidadesMedico(@RequestParam Long idMedico){
		try {
			return ResponseEntity.ok().body(servicio.buscarEspecialidadesMedico(idMedico));
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	@GetMapping("/eliminar_especialidad_medico")
	public ResponseEntity<?> eliminarEspecialidadMedico(@RequestParam Long idMedico, @RequestParam Long idEspecialidad){
		try {
			servicio.eliminarEspecialidadMedico(idMedico, idEspecialidad);
			return ResponseEntity.ok().body("Eliminación Correcta");
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	
	@GetMapping("/asignar_especialidad_medico")
	public ResponseEntity<?> asignarEspecialidadMedico(@RequestParam Long idMedico, @RequestParam Long idEspecialidad){
		try {
			return ResponseEntity.ok().body(servicio.asignarEspecialidadMedico(idMedico, idEspecialidad));
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	@GetMapping("/eliminar_medico")
	public ResponseEntity<?> eliminarMedico(@RequestParam Long idMedico){
		try {
			servicio.eliminarMedico(idMedico);
			return ResponseEntity.ok().body("Eliminación Correcta");
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	@GetMapping("/crear_citas")
	public ResponseEntity<?> crearCita(
	        @RequestParam Long idPaciente,
	        @RequestParam Long idMedico,
	        @RequestParam String codigo,
	        @RequestParam String descripcion,
	        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime fechaHora,
	        @RequestParam String estado) {

	    try {
	        return ResponseEntity.ok().body(servicio.crearCita(idPaciente, idMedico, codigo, descripcion, fechaHora, estado));
	    } catch (SQLException e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
	    }
	}
	
	
	@GetMapping("/buscar_citas")
	public ResponseEntity<?> buscarCitas(@RequestParam String codigo,
	    @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime fechaHora) {

	    try {
	        // Convertir LocalDateTime a String con formato yyyy-MM-dd
	        String fechaString = fechaHora != null ? 
	            fechaHora.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "";
	            
	        return ResponseEntity.ok().body(servicio.buscarCitas(codigo, fechaString));
	    } catch (SQLException e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
	    }
	}
	
	
	@GetMapping("/modificar_citas")
	public ResponseEntity<?> modificarCita(@RequestParam Long id, 
			@RequestParam Long idPaciente,
			@RequestParam Long idMedico,
			@RequestParam String codigo,
			@RequestParam String descripcion,
			@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime fechaHora,
			@RequestParam String estado){
		try {
			return ResponseEntity.ok().body(servicio.modificarCita(id, idPaciente, idMedico, codigo, descripcion, fechaHora, estado));
		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	
	@GetMapping("/eliminar_cita")
	public ResponseEntity<?> eliminarCita(@RequestParam Long idCita){
		try {
			servicio.eliminarCita(idCita);
			return ResponseEntity.ok().body("Eliminación Correcta");
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	
	@GetMapping("/buscar_citas_paciente")
	public ResponseEntity<?> buscarCitasPaciente(@RequestParam Long idPaciente){
		try {
			return ResponseEntity.ok().body(servicio.buscarCitasPaciente(idPaciente));
		} catch (SQLException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}
	

}
