
package com.ferreteria.copacabana.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "caja_turno")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CajaTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_turno")
    private Integer idTurno;

    @Column(name = "id_empleado", nullable = false)
    private Integer idEmpleado;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "monto_inicial", nullable = false)
    private BigDecimal montoInicial;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "monto_esperado")
    private BigDecimal montoEsperado;

    @Column(name = "monto_contado")
    private BigDecimal montoContado;

    @Column(name = "diferencia")
    private BigDecimal diferencia;

    @Column(length = 30)
    private String estado;

    @Column(name = "observacion_apertura")
    private String observacionApertura;

    @Column(name = "observacion_cierre")
    private String observacionCierre;
}
