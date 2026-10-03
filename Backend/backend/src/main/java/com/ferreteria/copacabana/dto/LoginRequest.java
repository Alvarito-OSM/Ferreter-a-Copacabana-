package com.ferreteria.copacabana.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String usuario;
    private String contrasena;
}