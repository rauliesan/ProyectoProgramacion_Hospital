package com.daw.services;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.daw.datamodel.entities.Cita;
import com.daw.datamodel.entities.Especialidad;
import com.daw.datamodel.entities.Historial;
import com.daw.datamodel.entities.Medico;
import com.daw.datamodel.entities.Paciente;

@Service
public class Servicio {

	static {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
	}
	
	// Buscar Pacientes
	public List<Paciente> buscarPacientes(String nombre2, String dni2) throws SQLException {
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
		Statement stmt = conn.createStatement();
		ResultSet rs = stmt.executeQuery("SELECT * FROM paciente WHERE nombre LIKE '%"+nombre2+"%' AND dni LIKE '%" + dni2 + "%'");
		List<Paciente> pacientes = new ArrayList<Paciente>();
		while (rs.next()) {
			Long id = rs.getLong("id");
			String nombre = rs.getString("nombre");
			String apellidos = rs.getString("apellidos");
			String dni = rs.getString("dni");
			String direccion = rs.getString("direccion");
			String telefono = rs.getString("telefono");
			Date fechaNacimiento = rs.getDate("fecha_nacimiento");
			Paciente paciente = new Paciente(id, nombre, apellidos, dni, direccion, telefono, fechaNacimiento);
			pacientes.add(paciente);
		}
		rs.close();
		stmt.close();
		conn.close();
		return pacientes;
	}
	
	// Crear Paciente
	public Paciente crearPaciente(String nombre, String apellidos, String dni, String direccion, String telefono, Date fechaNacimiento) throws SQLException {
	    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
	    Long id_paciente = null;

	    String sql = "INSERT INTO paciente (nombre, apellidos, dni, direccion, telefono, fecha_nacimiento) VALUES(?,?,?,?,?,?)";
	    PreparedStatement ps = conn.prepareStatement(sql);
	    ps.setString(1, nombre);
	    ps.setString(2, apellidos);
	    ps.setString(3, dni);
	    ps.setString(4, direccion);
	    ps.setString(5, telefono);
	    ps.setDate(6, fechaNacimiento);

	    int respuesta = ps.executeUpdate();
	    if(respuesta==1) {
	        System.out.println("Insercion correcta.");

	        // Consulta para obtener el ID del paciente usando el DNI (es único)
	        String sqlConsulta = "SELECT id FROM paciente WHERE dni = ?";
	        PreparedStatement psConsulta = conn.prepareStatement(sqlConsulta);
	        psConsulta.setString(1, dni);
	        ResultSet rs = psConsulta.executeQuery();

	        if(rs.next()) {
	            id_paciente = rs.getLong("id");

	            // Obtener la fecha actual de manera explícita con año, mes y día
	            LocalDate hoy = LocalDate.now();
	            java.sql.Date fechaActual = java.sql.Date.valueOf(hoy);
	            
	            // Corregido: "fechaCreacion" a "fecha_creacion"
	            String sqlHistorial = "INSERT INTO historial (id_paciente, dni, descripcion, fecha_creacion) VALUES(?, ?, ?, ?)";
	            PreparedStatement psHistorial = conn.prepareStatement(sqlHistorial);
	            psHistorial.setLong(1, id_paciente);
	            psHistorial.setString(2, dni);
	            psHistorial.setString(3, "Historial creado automáticamente");
	            psHistorial.setDate(4, fechaActual);

	            int respuestaHistorial = psHistorial.executeUpdate();

	            if(respuestaHistorial != 1) {
	                System.out.println("No se pudo crear el historial.");
	            } else {
	                System.out.println("Historial creado correctamente.");
	            }

	            psHistorial.close();
	            psConsulta.close();
	            rs.close();
	        } else {
	            throw new SQLException("No se pudo encontrar el ID del paciente recién insertado.");
	        }
	    } else {
	        throw new SQLException("No se ha podido insertar el nuevo paciente.");
	    }

	    ps.close();
	    conn.close();
	    return new Paciente(id_paciente, nombre, apellidos, dni, direccion, telefono, fechaNacimiento);
	}
	
	
	// Modificar Paciente
	public Paciente modificarPaciente(Long id, String nombre, String apellidos, String dni, String direccion, String telefono, Date fechaNacimiento) throws SQLException {
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
		
		String sqlPaciente = "UPDATE paciente SET nombre=?, apellidos=?, dni=?, direccion=?, telefono=?, fecha_nacimiento=? WHERE id=?";
		PreparedStatement psPaciente = conn.prepareStatement(sqlPaciente);
		psPaciente.setString(1, nombre);
		psPaciente.setString(2, apellidos);
		psPaciente.setString(3, dni);
		psPaciente.setString(4, direccion);
		psPaciente.setString(5, telefono);
		psPaciente.setDate(6, fechaNacimiento);
		psPaciente.setLong(7, id);

		int respuestaPaciente = psPaciente.executeUpdate();
	    if (respuestaPaciente != 1) {
	        throw new SQLException("No se ha podido actualizar el paciente.");
	    }
	    
	    // Actualizar el historial por si se ha actualizado el dni del paciente
	    String sqlHistorial = "UPDATE historial SET dni=? WHERE id_paciente=?";
	    PreparedStatement psHistorial = conn.prepareStatement(sqlHistorial);
	    psHistorial.setString(1, dni);
	    psHistorial.setLong(2, id);
	    
	    int respuestaHistorial = psHistorial.executeUpdate();
	    if (respuestaHistorial != 1) {
	        throw new SQLException("No se ha podido actualizar el historial.");
	    }
	    
		psPaciente.close();
		psHistorial.close();
		conn.close();
		return new Paciente(id, nombre, apellidos, dni, direccion, telefono, fechaNacimiento);
	}
	
	
	// Eliminar Paciente
	public void eliminarPaciente(Long id) throws SQLException{
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
		conn.setAutoCommit(false);
		
		// Borra el historial del paciente
		String sqlHistorial = "DELETE FROM historial WHERE id_paciente=?";
		PreparedStatement psHistorial = conn.prepareStatement(sqlHistorial);
		psHistorial.setLong(1, id);
		psHistorial.executeUpdate();
		
		// Borra la cita del paciente
		String sqlCita = "DELETE FROM cita WHERE id_paciente=?";
		PreparedStatement psCita = conn.prepareStatement(sqlCita);
		psCita.setLong(1, id);
		psCita.executeUpdate();
		
		String sqlPaciente = "DELETE FROM paciente WHERE id=?";
		PreparedStatement psPaciente = conn.prepareStatement(sqlPaciente);
		psPaciente.setLong(1, id);
		psPaciente.executeUpdate();
		conn.commit();
		conn.close();
	}
	
	// Buscar Historiales: Hacer que haya un desplegable que muestre las citas que tengan el id_paciente en la tabla citas (habrá que modificar también el css)
	public List<Historial> buscarHistoriales(String dni2) throws SQLException {
	    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
	    Statement stmt = conn.createStatement();
	    String sql = "SELECT * FROM historial WHERE dni LIKE '%" + dni2 + "%'";
	    ResultSet rs = stmt.executeQuery(sql);
	    List<Historial> historiales = new ArrayList<Historial>();
	    
	    while (rs.next()) {
	        Long id = rs.getLong("id");
	        Long idPaciente = rs.getLong("id_paciente");
	        String dni = rs.getString("dni");
	        String descripcion = rs.getString("descripcion");
	        Date fechaCreacion = rs.getDate("fecha_creacion");
	        Historial historial = new Historial(id, idPaciente, dni, descripcion, fechaCreacion);
	        historiales.add(historial);
	    }
	    
	    rs.close();
	    stmt.close();
	    conn.close();
	    return historiales;
	}
	
	// Editar Historial
	public Historial modificarHistorial(Long id, String descripcion, Date fechaCreacion) throws SQLException {
	    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");

	    // Error corregido: eliminar el segundo SET
	    String sql = "UPDATE historial SET descripcion=?, fecha_creacion=? WHERE id=?";
	    PreparedStatement ps = conn.prepareStatement(sql);
	    ps.setString(1, descripcion);
	    ps.setDate(2, fechaCreacion);
	    ps.setLong(3, id);

	    int respuesta = ps.executeUpdate();
	    if(respuesta==1) {
	        System.out.println("Actualización correcta.");
	    } else {
	        throw new SQLException("No se ha podido actualizar el historial.");
	    }
	    ps.close();
	    conn.close();
	    return new Historial(id, null, null, descripcion, fechaCreacion);
	}
	
	// Crear Especialidad
	public Especialidad crearEspecialidad(String nombre, String descripcion) throws SQLException {
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
			
		String sql = "INSERT INTO especialidad (nombre, descripcion) VALUES(?,?)";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setString(1, nombre);
		ps.setString(2, descripcion);

		int respuesta = ps.executeUpdate();
		if(respuesta==1) {
			System.out.println("Creación exitosa.");
		} else {
			throw new SQLException("No se ha podido crear la especialidad.");
		}
		ps.close();
		conn.close();
		return new Especialidad(null, nombre, descripcion);
	}
		
		
	// Buscar Especialidades
	public List<Especialidad> buscarEspecialidades(String nombre2) throws SQLException {
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
		Statement stmt = conn.createStatement();
		ResultSet rs = stmt.executeQuery("SELECT * FROM especialidad WHERE nombre LIKE '%"+nombre2+"%'");
		List<Especialidad> especialidades = new ArrayList<Especialidad>();
		while (rs.next()) {
			Long id = rs.getLong("id");
			String nombre = rs.getString("nombre");
			String descripcion = rs.getString("descripcion");
				
			Especialidad especialidad = new Especialidad(id, nombre, descripcion);
			especialidades.add(especialidad);
		}
		rs.close();
		stmt.close();
		conn.close();
		return especialidades;
	}
		
	// Modificar Especialidad
	public Especialidad modificarEspecialidad(Long id, String nombre, String descripcion) throws SQLException {
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
			
		String sql = "UPDATE especialidad SET nombre=?, descripcion=? WHERE id=?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setString(1, nombre);
		ps.setString(2, descripcion);
		ps.setLong(3, id);

		int respuesta = ps.executeUpdate();
		if(respuesta==1) {
			System.out.println("Actualización exitosa.");
		} else {
			throw new SQLException("No se ha podido actualizar la especialidad.");
		}
		ps.close();
		conn.close();
		return new Especialidad(id, nombre, descripcion);
	}
		
	// Eliminar Especialidad: Comprobar más tarde que si un médico no tiene más especialidades que se elimine
	public void eliminarEspecialidad(Long id) throws SQLException{
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
		conn.setAutoCommit(false);
			
		// Borra la especialidad del médico en la tabla medico_especialidad
		String sqlMedicoEspecialidad = "DELETE FROM medico_especialidad WHERE id_especialidad=?";
		PreparedStatement psMedicoEspecialidad = conn.prepareStatement(sqlMedicoEspecialidad);
		psMedicoEspecialidad.setLong(1, id);
		psMedicoEspecialidad.executeUpdate();
			
		// Borra la cita del paciente
		String sqlEspecialidad = "DELETE FROM especialidad WHERE id=?";
		PreparedStatement psEspecialidad = conn.prepareStatement(sqlEspecialidad);
		psEspecialidad.setLong(1, id);
		psEspecialidad.executeUpdate();
			
		conn.commit();
		conn.close();
	}
		
		
	// Crear Médico: Crea el médico y se le asigna por defecto en la tabla medico_especialidad el id de la especialidad llamada "Médico General" y sino existe, se crea y se le asigna
	public Medico crearMedico(String nombre, String apellidos, String dni, String numColegiado, Long idEspecialidad) throws SQLException {
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
			
		String sqlMedico = "INSERT INTO medico (nombre, apellidos, dni, num_colegiado) VALUES(?,?,?,?)";
		PreparedStatement psMedico = conn.prepareStatement(sqlMedico);
		psMedico.setString(1, nombre);
		psMedico.setString(2, apellidos);
		psMedico.setString(3, dni);
		psMedico.setString(4, numColegiado);
		
			

		int respuesta = psMedico.executeUpdate();
		Long idMedico = null;
		if(respuesta==1) {
			System.out.println("Creación exitosa.");
		} else {
			throw new SQLException("No se ha podido crear la especialidad.");
		}
		// Consulta para obtener el ID del medico usando el DNI (es único)
		String sqlConsulta = "SELECT id FROM medico WHERE dni = ?";
		PreparedStatement psConsulta = conn.prepareStatement(sqlConsulta);
		psConsulta.setString(1, dni);
		ResultSet rs = psConsulta.executeQuery();

		if(rs.next()) {
			idMedico = rs.getLong("id");
	            
			// Inserta el id del medico y el id de la especialidad en la tabla intermedia medico_especialidad
			String sqlMedicoEspecialidad = "INSERT INTO medico_especialidad (id_especialidad, id_medico) VALUES(?,?)";
			PreparedStatement psMedicoEspecialidad = conn.prepareStatement(sqlMedicoEspecialidad);
			psMedicoEspecialidad.setLong(1, idEspecialidad);
			psMedicoEspecialidad.setLong(2, idMedico);
				

			int respuestaMedicoEspecialidad = psMedicoEspecialidad.executeUpdate();

			if(respuestaMedicoEspecialidad != 1) {
				System.out.println("No se pudo crear la inserción de médico y especialidad.");
			} else {
				System.out.println("Inserción de la tabla intermedia creada correctamente.");
			}

			psMedicoEspecialidad.close();
			psConsulta.close();
			rs.close();
		} else {
			throw new SQLException("No se pudo encontrar el ID del paciente recién insertado.");
		}
			
		psMedico.close();
		conn.close();
		return new Medico(null, nombre, apellidos, dni, numColegiado);
	}
		
		
		
	// Buscar Medicos
	public List<Medico> buscarMedicos(String nombre2, String dni2) throws SQLException {
	    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
	    Statement stmt = conn.createStatement();
	    String sql = "SELECT * FROM medico WHERE nombre LIKE '%"+nombre2+"%' AND dni LIKE '%" + dni2 + "%'";
	    ResultSet rs = stmt.executeQuery(sql);
	    List<Medico> medicos = new ArrayList<Medico>();
		    
	    while (rs.next()) {
	        Long id = rs.getLong("id");
	        String nombre = rs.getString("nombre");
	        String apellidos = rs.getString("apellidos");
	        String dni = rs.getString("dni");
	        String numColegiado = rs.getString("num_colegiado");
	        Medico medico = new Medico(id, nombre, apellidos, dni, numColegiado);
	        medicos.add(medico);
	    }
		    
	    rs.close();	
	    stmt.close();
	    conn.close();
	    return medicos;
	}
		
		
	// Editar Médico
	public Medico modificarMedico(Long id, String nombre, String apellidos, String dni, String numColegiado) throws SQLException {
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
			
		String sql = "UPDATE medico SET nombre=?, apellidos=?, dni=?, num_colegiado=? WHERE id=?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setString(1, nombre);
		ps.setString(2, apellidos);
		ps.setString(3, dni);
		ps.setString(4, numColegiado);
		ps.setLong(5, id);

		int respuesta = ps.executeUpdate();
		if(respuesta==1) {
			System.out.println("Actualización exitosa.");
		} else {
			throw new SQLException("No se ha podido actualizar la especialidad.");
		}
		ps.close();
		conn.close();
		return new Medico(id, nombre, apellidos, dni, numColegiado);
	}
		
		
	// Buscar especialidades de un médico específico
	public List<Especialidad> buscarEspecialidadesMedico(Long idMedico) throws SQLException {
	    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario", "usuario");
		    
	    // Consulta SQL para obtener las especialidades asignadas a un médico específico
	    String sql = "SELECT e.id, e.nombre, e.descripcion " +
		                 "FROM especialidad e " +
		                 "JOIN medico_especialidad me ON e.id = me.id_especialidad " +
		                 "WHERE me.id_medico = ?";
		                 
	    PreparedStatement ps = conn.prepareStatement(sql);
	    ps.setLong(1, idMedico);
	    ResultSet rs = ps.executeQuery();
		    
	    List<Especialidad> especialidades = new ArrayList<Especialidad>();
	    
	    while (rs.next()) {	
	    	Long id = rs.getLong("id");
	    	String nombre = rs.getString("nombre");
	    	String descripcion = rs.getString("descripcion");
		        
	    	Especialidad especialidad = new Especialidad(id, nombre, descripcion);
	    	especialidades.add(especialidad);
	    }
		    
	    rs.close();
	    ps.close();
	    conn.close();
		    
	    return especialidades;
	}
		
		
	// Borrar una especialidad de un médico
	public void eliminarEspecialidadMedico(Long idMedico, Long idEspecialidad) throws SQLException{
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
			
		// Borra la especialidad del médico en la tabla medico_especialidad
		String sql = "DELETE FROM medico_especialidad WHERE id_medico=? AND id_especialidad=?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, idMedico);
		ps.setLong(2, idEspecialidad);
		ps.executeUpdate();
			
		conn.close();
	}
		
	// Asignar una Especialidad a un Médico
	public boolean asignarEspecialidadMedico(Long idMedico, Long idEspecialidad) throws SQLException {
	    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario", "usuario");
		    
	    // Verificar si ya existe la asignación
	    String sqlVerificar = "SELECT COUNT(*) FROM medico_especialidad WHERE id_medico = ? AND id_especialidad = ?";
	    PreparedStatement psVerificar = conn.prepareStatement(sqlVerificar);
	    psVerificar.setLong(1, idMedico);
	    psVerificar.setLong(2, idEspecialidad);
	    ResultSet rs = psVerificar.executeQuery();
	    rs.next();
	    int count = rs.getInt(1);
		    
	    // Si ya existe, cerrar recursos y lanzar excepción
	    if (count > 0) {
	        rs.close();
	        psVerificar.close();
	        conn.close();
	        throw new SQLException("El médico ya tiene asignada esta especialidad.");
	    }
		    
		// Si no existe, realizar la inserción
	    String sqlInsertar = "INSERT INTO medico_especialidad (id_medico, id_especialidad) VALUES (?, ?)";
	    PreparedStatement psInsertar = conn.prepareStatement(sqlInsertar);
	    psInsertar.setLong(1, idMedico);
	    psInsertar.setLong(2, idEspecialidad);
	    int filasAfectadas = psInsertar.executeUpdate();
		    
	    // Cerrar todos los recursos
	    rs.close();
	    psVerificar.close();
	    psInsertar.close();
	    conn.close();
		    
	    if(filasAfectadas == 0) {
	    	throw new SQLException("No se ha podido asignar la especialidad.");
	    }
		    
	    return true;
	}
		
		
	// Eliminar Médico
	public boolean eliminarMedico(Long idMedico) throws SQLException {
	    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario", "usuario");
	    conn.setAutoCommit(false);
	    // Eliminar las relaciones en la tabla intermedia
	    String sqlEliminarRelaciones = "DELETE FROM medico_especialidad WHERE id_medico = ?";
	    PreparedStatement psEliminarRelaciones = conn.prepareStatement(sqlEliminarRelaciones);
	    psEliminarRelaciones.setLong(1, idMedico);
	    psEliminarRelaciones.executeUpdate();
	    psEliminarRelaciones.close();
		    
	    // Eliminar el médico
	    String sqlEliminarMedico = "DELETE FROM medico WHERE id = ?";
	    PreparedStatement psEliminarMedico = conn.prepareStatement(sqlEliminarMedico);
	    psEliminarMedico.setLong(1, idMedico);
	    int filasAfectadas = psEliminarMedico.executeUpdate();
	    psEliminarMedico.close();
		    
	    conn.commit();
	    conn.close();
		    
	    return filasAfectadas > 0;
	}
	
	
	
	
	// Crear Cita
	public Cita crearCita(Long idPaciente, Long idMedico, String codigo, String descripcion, LocalDateTime fechaHora, String estado) throws SQLException {
	    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario", "usuario");
	    
	    String sql = "INSERT INTO cita (id_paciente, id_medico, codigo, descripcion, fecha_hora, estado) VALUES(?, ?, ?, ?, ?, ?)";
	    PreparedStatement ps = conn.prepareStatement(sql);
	    ps.setLong(1, idPaciente);
	    ps.setLong(2, idMedico);
	    ps.setString(3, codigo);
	    ps.setString(4, descripcion);
	    
	    // Convertir LocalDateTime a Timestamp para la base de datos
	    Timestamp timestamp = Timestamp.valueOf(fechaHora);
	    ps.setTimestamp(5, timestamp);
	    
	    ps.setString(6, estado);
	    
	    int respuesta = ps.executeUpdate();
	    Long idCita = null;
	    
	    if (respuesta == 1) {
	    	System.out.println("Cita creada correctamente");
	    } else {
	        throw new SQLException("No se ha podido crear la cita.");
	    }
	    
	    ps.close();
	    conn.close();
	    
	    Cita cita = new Cita(idCita, idPaciente, idMedico, codigo, descripcion, fechaHora, estado);
	    return cita;
	}
	
		
	// Buscar Citas
	// En los controladores la fecha está definida como un LocalDateTime (que se formatea) y aquí como un String
	public List<Cita> buscarCitas(String codigo, String fecha) throws SQLException {
	    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario", "usuario");
	    Statement stmt = conn.createStatement();
	    
	    StringBuilder sql = new StringBuilder("SELECT c.id, c.id_paciente, c.id_medico, c.codigo, c.descripcion, c.fecha_hora, c.estado, ");
	    sql.append("p.nombre as nombre_paciente, p.apellidos as apellidos_paciente, ");
	    sql.append("m.nombre as nombre_medico, m.apellidos as apellidos_medico ");
	    sql.append("FROM cita c ");
	    sql.append("JOIN paciente p ON c.id_paciente = p.id ");
	    sql.append("JOIN medico m ON c.id_medico = m.id ");
	    sql.append("WHERE 1=1 ");
	    
	    if (codigo != null && !codigo.isEmpty()) {
	        sql.append("AND c.codigo LIKE '%" + codigo + "%' ");
	    }
	    
	    if (fecha != null && !fecha.isEmpty()) {
	        sql.append("AND c.fecha_hora = '" + fecha + "' ");
	    }
	    
	    ResultSet rs = stmt.executeQuery(sql.toString());
	    List<Cita> citas = new ArrayList<Cita>();
	    
	    while (rs.next()) {
	        Long id = rs.getLong("id");
	        Long idPaciente = rs.getLong("id_paciente");
	        Long idMedico = rs.getLong("id_medico");
	        String citaCodigo = rs.getString("codigo");
	        String descripcion = rs.getString("descripcion");
	        
	        // Convertir Timestamp a LocalDateTime
	        Timestamp timestamp = rs.getTimestamp("fecha_hora");
	        LocalDateTime fechaHora = timestamp.toLocalDateTime();
	        
	        String estado = rs.getString("estado");
	        
	        // Información adicional para mostrar en la interfaz
	        String nombrePaciente = rs.getString("nombre_paciente");
	        String apellidosPaciente = rs.getString("apellidos_paciente");
	        String nombreMedico = rs.getString("nombre_medico");
	        String apellidosMedico = rs.getString("apellidos_medico");
	        
	        Cita cita = new Cita(id, idPaciente, idMedico, citaCodigo, descripcion, fechaHora, estado);
	        
	        // Añadir campos adicionales si existe una implementación que los soporte
	        // Si la clase Cita no tiene estos campos, puedes comentar estas líneas
	        cita.setNombrePaciente(nombrePaciente);
	        cita.setApellidosPaciente(apellidosPaciente);
	        cita.setNombreMedico(nombreMedico);
	        cita.setApellidosMedico(apellidosMedico);
	        
	        citas.add(cita);
	    }
	    
	    rs.close();
	    stmt.close();
	    conn.close();
	    return citas;
	}
	
	// Editar Cita
	public Cita modificarCita(Long id, Long idPaciente, Long idMedico, String codigo, String descripcion, LocalDateTime fechaHora, String estado) throws SQLException {
		Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario","usuario");
			
		String sql = "UPDATE cita SET id_paciente=?, id_medico=?, codigo=?, descripcion=?, fecha_hora=?, estado=? WHERE id=?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, idPaciente);
		ps.setLong(2, idMedico);
		ps.setString(3, codigo);
		ps.setString(4, descripcion);
		Timestamp timestamp = Timestamp.valueOf(fechaHora);
		ps.setTimestamp(5, timestamp);
		ps.setString(6, estado);
		ps.setLong(7, id);

		int respuesta = ps.executeUpdate();
		if(respuesta==1) {
			System.out.println("Actualización exitosa.");
		} else {
			throw new SQLException("No se ha podido actualizar la cita.");
		}
		ps.close();
		conn.close();
		return new Cita(id, idPaciente, idMedico, codigo, descripcion, fechaHora, estado);
	}
	
	// Eliminar Cita
	public boolean eliminarCita(Long idCita) throws SQLException {
	    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario", "usuario");
	    conn.setAutoCommit(false);

	    String sql = "DELETE FROM cita WHERE id = ?";
	    PreparedStatement ps = conn.prepareStatement(sql);
	    ps.setLong(1, idCita);
	    int filasAfectadas = ps.executeUpdate();
	    ps.close();
			    
	    conn.commit();
	    conn.close();
			    
	    return filasAfectadas > 0;
	}
	
	 // Buscar Citas por ID de Paciente
    public List<Cita> buscarCitasPaciente(Long idCita) throws SQLException {
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital", "usuario", "usuario");

        // Unir con médico para obtener nombre y apellidos del médico
        String sql = "SELECT c.id, c.id_paciente, c.id_medico, c.codigo, c.descripcion, c.fecha_hora, c.estado, " +
                     "m.nombre as nombre_medico, m.apellidos as apellidos_medico " +
                     "FROM cita c " +
                     "JOIN medico m ON c.id_medico = m.id " +
                     "WHERE c.id_paciente = ? " +
                     "ORDER BY c.fecha_hora DESC"; // Ordenar por fecha descendente (más recientes primero)

        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setLong(1, idCita);

        ResultSet rs = ps.executeQuery();
        List<Cita> citas = new ArrayList<>();

        while (rs.next()) {
            Long id = rs.getLong("id");
            Long idPaciente = rs.getLong("id_paciente");
            Long idMedico = rs.getLong("id_medico");
            String citaCodigo = rs.getString("codigo");
            String descripcion = rs.getString("descripcion");

            Timestamp timestamp = rs.getTimestamp("fecha_hora");
            LocalDateTime fechaHora = null;
            if (timestamp != null) {
                 fechaHora = timestamp.toLocalDateTime();
            }

            String estado = rs.getString("estado");

            // Información adicional del médico
            String nombreMedico = rs.getString("nombre_medico");
            String apellidosMedico = rs.getString("apellidos_medico");

            Cita cita = new Cita(id, idPaciente, idMedico, citaCodigo, descripcion, fechaHora, estado);

            // Establecer los nombres del médico en el objeto Cita (asegúrate que la clase Cita tiene estos setters)
            cita.setNombreMedico(nombreMedico);
            cita.setApellidosMedico(apellidosMedico);

            citas.add(cita);
        }

        rs.close();
        ps.close();
        conn.close();
        return citas;
    }

}
