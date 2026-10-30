
package com.ferreteria.copacabana.dto;

import lombok.Data;

@Data
public class AjusteInventarioRequest {

    private Integer idProducto;
    private String tipo; // ENTRADA o SALIDA
    private Integer cantidad;
    private String motivo;
}
