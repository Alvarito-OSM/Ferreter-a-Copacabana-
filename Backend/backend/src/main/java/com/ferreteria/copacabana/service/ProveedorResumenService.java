package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.dto.ProveedorResumenResponse;
import com.ferreteria.copacabana.dto.ProveedorResumenResponse.CompraResumen;
import com.ferreteria.copacabana.dto.ProveedorResumenResponse.ProductoSuministrado;
import com.ferreteria.copacabana.model.Compra;
import com.ferreteria.copacabana.repository.CompraRepository;
import com.ferreteria.copacabana.repository.DetalleCompraRepository;
import com.ferreteria.copacabana.repository.ProveedorRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProveedorResumenService {

    private static final String ESTADO_ANULADA = "ANULADA";

    private final ProveedorRepository proveedorRepository;
    private final CompraRepository compraRepository;
    private final DetalleCompraRepository detalleCompraRepository;

    public ProveedorResumenService(
            ProveedorRepository proveedorRepository,
            CompraRepository compraRepository,
            DetalleCompraRepository detalleCompraRepository
    ) {
        this.proveedorRepository = proveedorRepository;
        this.compraRepository = compraRepository;
        this.detalleCompraRepository = detalleCompraRepository;
    }

    public Optional<ProveedorResumenResponse> obtenerResumen(Integer idProveedor) {
        return proveedorRepository.findById(idProveedor).map(proveedor -> {
            List<Compra> compras = compraRepository.findByIdProveedorOrderByFechaDesc(idProveedor);

            BigDecimal totalGastado = compras.stream()
                    .filter(compra -> !ESTADO_ANULADA.equals(compra.getEstado()))
                    .map(Compra::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            LocalDateTime ultimaCompra = compras.isEmpty() ? null : compras.get(0).getFecha();

            List<CompraResumen> historial = compras.stream()
                    .map(compra -> new CompraResumen(
                            compra.getIdCompra(),
                            compra.getFecha(),
                            compra.getSubtotal(),
                            compra.getIva(),
                            compra.getTotal(),
                            compra.getEstado()))
                    .toList();

            List<ProductoSuministrado> productos =
                    agruparProductos(detalleCompraRepository.findSuministrosPorProveedor(idProveedor));

            return new ProveedorResumenResponse(
                    proveedor,
                    compras.size(),
                    totalGastado,
                    ultimaCompra,
                    historial,
                    productos
            );
        });
    }

    private List<ProductoSuministrado> agruparProductos(List<Object[]> filas) {
        Map<Integer, ProductoSuministrado> porProducto = new LinkedHashMap<>();

        for (Object[] fila : filas) {
            Integer idProducto = (Integer) fila[0];
            ProductoSuministrado compra = new ProductoSuministrado(
                    idProducto,
                    (String) fila[1],
                    (String) fila[2],
                    ((Number) fila[3]).longValue(),
                    (BigDecimal) fila[4],
                    (LocalDateTime) fila[5]
            );

            porProducto.merge(idProducto, compra, (acumulado, nueva) -> new ProductoSuministrado(
                    idProducto,
                    acumulado.nombre(),
                    acumulado.codigoBarras(),
                    acumulado.unidadesCompradas() + nueva.unidadesCompradas(),
                    acumulado.ultimoPrecio(),
                    acumulado.ultimaCompra()
            ));
        }

        return new ArrayList<>(porProducto.values());
    }
}
