
package com.ferreteria.copacabana.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimiento_caja")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Integer idMovimiento;

    @Column(name = "id_turno", nullable = false)
    private Integer idTurno;

    @Column(name = "id_pago")
    private Integer idPago;

    @Column(nullable = false, length = 30)
    private String tipo;

    @Column(length = 255)
    private String concepto;

    @Column(nullable = false)
    private BigDecimal monto;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    protected void onCreate() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }
}
