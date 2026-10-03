package com.ferreteria.copacabana.dto;

import lombok.Data;

@Data
public class DetalleVentaRequest {

    private Integer idProducto;
    private Integer cantidad;
}