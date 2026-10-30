
package com.ferreteria.copacabana.dto;

import lombok.Data;
import java.util.List;

@Data
public class CompraRequest {

    private Integer idProveedor;

    private Integer idAdministrador;

    private List<DetalleCompraRequest> detalles;
}
