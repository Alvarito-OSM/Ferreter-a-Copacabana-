
package com.ferreteria.copacabana.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lote_producto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoteProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lote")
    private Integer idLote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_detalle_compra", unique = true)
    private DetalleCompra detalleCompra;

    @Column(name = "codigo_lote", nullable = false, length = 100)
    private String codigoLote;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "cantidad_inicial", nullable = false)
    private Integer cantidadInicial;

    @Column(name = "cantidad_disponible", nullable = false)
    private Integer cantidadDisponible;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        if (fechaIngreso == null) {
            fechaIngreso = LocalDate.now();
        }

        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}
