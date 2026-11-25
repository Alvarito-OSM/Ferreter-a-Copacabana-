package com.ferreteria.copacabana.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleCompraResponseDTO {
    private Integer idDetalleCompra;
    private Integer idCompra;
    private Integer idProducto;
    private String nombreProducto;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;

    public DetalleCompraResponseDTO(Integer idDetalleCompra, Integer idCompra, Integer idProducto, String nombreProducto, Integer cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {
        this.idDetalleCompra = idDetalleCompra;
        this.idCompra = idCompra;
        this.idProducto = idProducto;
        this.nombreProducto = nombreProducto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
    }
    
    public DetalleCompraResponseDTO() {}
}
