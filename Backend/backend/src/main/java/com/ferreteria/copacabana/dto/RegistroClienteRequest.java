package com.ferreteria.copacabana.dto;

import lombok.Data;

@Data
public class RegistroClienteRequest {
    private String nombre;
    private String apellido;
    private String cedulaNit;
    private String telefono;
    private String email;
    private String direccion;
    private String usuario;
    private String contrasena;
}
