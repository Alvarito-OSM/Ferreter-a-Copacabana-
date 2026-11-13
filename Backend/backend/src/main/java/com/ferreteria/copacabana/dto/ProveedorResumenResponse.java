package com.ferreteria.copacabana.dto;

import com.ferreteria.copacabana.model.Proveedor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProveedorResumenResponse(
        Proveedor proveedor,
        int totalCompras,
        BigDecimal totalGastado,
        LocalDateTime ultimaCompra,
        List<CompraResumen> compras,
        List<ProductoSuministrado> productos
) {

    public record CompraResumen(
            Integer idCompra,
            LocalDateTime fecha,
            BigDecimal subtotal,
            BigDecimal iva,
            BigDecimal total,
            String estado
    ) {}

    public record ProductoSuministrado(
            Integer idProducto,
            String nombre,
            String codigoBarras,
            long unidadesCompradas,
            BigDecimal ultimoPrecio,
            LocalDateTime ultimaCompra
    ) {}
}
