
package com.ferreteria.copacabana.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DetalleCompraRequest {

    private Integer idProducto;

    private Integer cantidad;

    private BigDecimal precioUnitario;

    private BigDecimal descuento;

    private String lote;

    private LocalDate fechaVencimiento;
}
