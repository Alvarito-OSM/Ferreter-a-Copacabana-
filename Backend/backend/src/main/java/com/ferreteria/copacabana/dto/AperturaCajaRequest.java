
package com.ferreteria.copacabana.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AperturaCajaRequest {
    private Integer idEmpleado;
    private BigDecimal montoInicial;
    private String observacionApertura;
}
