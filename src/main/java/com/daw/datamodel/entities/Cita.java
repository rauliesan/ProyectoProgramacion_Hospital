package com.daw.datamodel.entities;

import java.time.LocalDateTime;

public class Cita {
	
	private Long id;
	private Long idPaciente;
	private Long idMedico;
	private String codigo;
	private String descripcion;
	private LocalDateTime fechaHora;
	private String estado;
	
	
	// Campos adicionales para mostrar en la interfaz
    private String nombrePaciente;
    private String apellidosPaciente;
    private String nombreMedico;
    private String apellidosMedico;
	
    public Cita(Long id, Long idPaciente, Long idMedico, String codigo, String descripcion, LocalDateTime fechaHora, String estado) {
        this.id = id;
        this.idPaciente = idPaciente;
        this.idMedico = idMedico;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.fechaHora = fechaHora;
        this.estado = estado;
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
    
    public Long getIdMedico() {
        return idMedico;
    }
    
    public void setIdMedico(Long idMedico) {
        this.idMedico = idMedico;
    }
    
    public String getCodigo() {
        return codigo;
    }
    
    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public LocalDateTime getFechaHora() {
        return fechaHora;
    }
    
    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }


	public String getEstado() {
		return estado;
	}


	public void setEstado(String estado) {
		this.estado = estado;
	}
    
    
	// Para mostrarlo en la interfaz
	public String getNombrePaciente() {
        return nombrePaciente;
    }
    
    public void setNombrePaciente(String nombrePaciente) {
        this.nombrePaciente = nombrePaciente;
    }
    
    public String getApellidosPaciente() {
        return apellidosPaciente;
    }
    
    public void setApellidosPaciente(String apellidosPaciente) {
        this.apellidosPaciente = apellidosPaciente;
    }
    
    public String getNombreMedico() {
        return nombreMedico;
    }
    
    public void setNombreMedico(String nombreMedico) {
        this.nombreMedico = nombreMedico;
    }
    
    public String getApellidosMedico() {
        return apellidosMedico;
    }
    
    public void setApellidosMedico(String apellidosMedico) {
        this.apellidosMedico = apellidosMedico;
    }
	
	
}
