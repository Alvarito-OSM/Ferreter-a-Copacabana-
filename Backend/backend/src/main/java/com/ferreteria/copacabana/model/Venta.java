package com.ferreteria.copacabana.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
@Table(name = "venta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Integer idVenta;

    @Column(name = "id_cliente", nullable = false)
    private Integer idCliente;

    @Column(name = "id_empleado", nullable = false)
    private Integer idEmpleado;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal iva = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String estado = "COMPLETADA";

    @PrePersist
    protected void onCreate() {
        if (this.fecha == null) {
            this.fecha = LocalDateTime.now();
        }
        if (this.subtotal == null) this.subtotal = BigDecimal.ZERO;
        if (this.iva == null) this.iva = BigDecimal.ZERO;
        if (this.descuento == null) this.descuento = BigDecimal.ZERO;
        if (this.total == null) this.total = BigDecimal.ZERO;
        if (this.estado == null) this.estado = "COMPLETADA";
    }
}
