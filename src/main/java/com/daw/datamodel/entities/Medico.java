package com.daw.datamodel.entities;

public class Medico {
	
	private Long id;
	private String nombre;
	private String dni;
	private String apellidos;
	private String numColegiado;
	
	
	public Medico(Long id, String nombre, String apellidos, String dni, String numColegiado) {
		super();
		this.id = id;
		this.nombre = nombre;
		this.apellidos = apellidos;
		this.dni = dni;
		this.numColegiado = numColegiado;
	}


	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}


	public String getNombre() {
		return nombre;
	}


	public void setNombre(String nombre) {
		this.nombre = nombre;
	}


	public String getDni() {
		return dni;
	}


	public void setDni(String dni) {
		this.dni = dni;
	}


	public String getApellidos() {
		return apellidos;
	}


	public void setApellidos(String apellidos) {
		this.apellidos = apellidos;
	}


	public String getNumColegiado() {
		return numColegiado;
	}


	public void setNumColegiado(String numColegiado) {
		this.numColegiado = numColegiado;
	}
	
	
	
}
