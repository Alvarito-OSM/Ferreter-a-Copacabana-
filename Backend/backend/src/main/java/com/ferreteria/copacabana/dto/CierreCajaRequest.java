
package com.ferreteria.copacabana.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CierreCajaRequest {
    private BigDecimal montoContado;
    private String observacionCierre;
}
