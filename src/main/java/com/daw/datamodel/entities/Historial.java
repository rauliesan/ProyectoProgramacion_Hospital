package com.daw.datamodel.entities;

import java.util.Date;

public class Historial {
	
	private Long id;
	private Long idPaciente;
	private String dni;
	private String descripcion;
	private Date fechaCreacion;
	
	
	public Historial(Long id, Long idPaciente, String dni, String descripcion, Date fechaCreacion) {
		super();
		this.id = id;
		this.idPaciente = idPaciente;
		this.dni = dni;
		this.descripcion = descripcion;
		this.fechaCreacion = fechaCreacion;
	}


	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}


	public Long getIdPaciente() {
		return idPaciente;
	}


	public void setIdPaciente(Long idPaciente) {
		this.idPaciente = idPaciente;
	}

	
	public String getDni() {
		return dni;
	}


	public void setDni(String dni) {
		this.dni = dni;
	}


	public String getDescripcion() {
		return descripcion;
	}


	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}


	public Date getFechaCreacion() {
		return fechaCreacion;
	}


	public void setFechaCreacion(Date fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}
	
	
	
}
