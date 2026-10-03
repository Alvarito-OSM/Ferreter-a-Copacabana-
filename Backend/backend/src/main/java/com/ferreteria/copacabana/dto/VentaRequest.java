package com.ferreteria.copacabana.dto;

import lombok.Data;
import java.util.List;

@Data
public class VentaRequest {

    private Integer idCliente;
    private Integer idEmpleado;
    private List<DetalleVentaRequest> detalles;
}