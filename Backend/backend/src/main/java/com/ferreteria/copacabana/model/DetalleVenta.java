package com.ferreteria.copacabana.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_venta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_venta")
    private Integer idDetalleVenta;

    @Column(name = "id_venta", nullable = false)
    private Integer idVenta;

    @Column(name = "id_producto", nullable = false)
    private Integer idProducto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @PrePersist
    protected void onCreate() {
        if (this.descuento == null) {
            this.descuento = BigDecimal.ZERO;
        }
        if (this.subtotal == null) {
            this.subtotal = BigDecimal.ZERO;
        }
    }
}