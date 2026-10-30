
package com.ferreteria.copacabana.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MovimientoCajaRequest {
    private String tipo;
    private String concepto;
    private BigDecimal monto;
}
