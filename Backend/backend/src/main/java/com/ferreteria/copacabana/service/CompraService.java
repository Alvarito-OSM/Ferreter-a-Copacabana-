
package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.dto.CompraRequest;
import com.ferreteria.copacabana.dto.DetalleCompraRequest;
import com.ferreteria.copacabana.model.*;
import com.ferreteria.copacabana.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final DetalleCompraRepository detalleCompraRepository;
    private final ProductoRepository productoRepository;
    private final InventarioRepository inventarioRepository;
    private final AdministradorRepository administradorRepository;
    private final ProveedorRepository proveedorRepository;
    private final LoteProductoRepository loteProductoRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    private static final BigDecimal IVA_RATE = new BigDecimal("0.13");

    public CompraService(
            CompraRepository compraRepository,
            DetalleCompraRepository detalleCompraRepository,
            ProductoRepository productoRepository,
            InventarioRepository inventarioRepository,
            AdministradorRepository administradorRepository,
            ProveedorRepository proveedorRepository,
            LoteProductoRepository loteProductoRepository,
            MovimientoInventarioRepository movimientoRepository) {

        this.compraRepository = compraRepository;
        this.detalleCompraRepository = detalleCompraRepository;
        this.productoRepository = productoRepository;
        this.inventarioRepository = inventarioRepository;
        this.administradorRepository = administradorRepository;
        this.proveedorRepository = proveedorRepository;
        this.loteProductoRepository = loteProductoRepository;
        this.movimientoRepository = movimientoRepository;
    }

    @Transactional
    public Compra registrarCompra(CompraRequest request) {

        if (request.getDetalles() == null ||
                request.getDetalles().isEmpty()) {
            throw new RuntimeException(
                    "La compra debe tener al menos un producto");
        }

        if (!proveedorRepository.existsById(request.getIdProveedor())) {
            throw new RuntimeException("Proveedor no encontrado");
        }

        Administrador administrador =
                administradorRepository.findById(request.getIdAdministrador())
                .orElseThrow(() ->
                        new RuntimeException("Administrador no encontrado"));

        Compra compra = new Compra();
        compra.setIdProveedor(request.getIdProveedor());
        compra.setIdAdministrador(request.getIdAdministrador());
        compra.setFecha(LocalDateTime.now());
        compra.setEstado("COMPLETADA");

        Compra compraGuardada = compraRepository.save(compra);

        BigDecimal subtotalTotal = BigDecimal.ZERO;

        for (DetalleCompraRequest item : request.getDetalles()) {

            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new RuntimeException("Cantidad inválida");
            }

            if (item.getPrecioUnitario() == null ||
                    item.getPrecioUnitario().signum() < 0) {
                throw new RuntimeException("Precio inválido");
            }

            Producto producto = productoRepository.findById(
                    item.getIdProducto())
                    .orElseThrow(() ->
                            new RuntimeException("Producto no encontrado"));

            BigDecimal precio = item.getPrecioUnitario()
                    .setScale(2, RoundingMode.HALF_UP);

            BigDecimal descuento = item.getDescuento() == null
                    ? BigDecimal.ZERO
                    : item.getDescuento().setScale(2, RoundingMode.HALF_UP);

            BigDecimal bruto = precio.multiply(
                    BigDecimal.valueOf(item.getCantidad()));

            if (descuento.signum() < 0 || descuento.compareTo(bruto) > 0) {
                throw new RuntimeException("Descuento inválido");
            }

            BigDecimal subtotal = bruto.subtract(descuento);

            // Registrar detalle de compra
            DetalleCompra detalle = new DetalleCompra();
            detalle.setIdCompra(compraGuardada.getIdCompra());
            detalle.setIdProducto(producto.getIdProducto());
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precio);
            detalle.setDescuento(descuento);
            detalle.setSubtotal(subtotal);
            detalle.setLote(item.getLote());
            detalle.setFechaVencimiento(item.getFechaVencimiento());

            DetalleCompra detalleGuardado =
                    detalleCompraRepository.saveAndFlush(detalle);

            // Buscar o crear inventario
            Inventario inventario = inventarioRepository
                    .buscarPorProductoBloqueado(producto.getIdProducto())
                    .orElseGet(() -> {
                        Inventario nuevo = new Inventario();
                        nuevo.setProducto(producto);
                        nuevo.setAdministrador(administrador);
                        nuevo.setStockActual(0);
                        nuevo.setStockMinimo(5);
                        nuevo.setFechaActualizacion(LocalDateTime.now());
                        return nuevo;
                    });

            int stockAnterior = inventario.getStockActual();
            int stockNuevo = stockAnterior + item.getCantidad();

            inventario.setStockActual(stockNuevo);
            inventario.setFechaActualizacion(LocalDateTime.now());

            inventarioRepository.save(inventario);

            // Registrar lote cuando existe lote o vencimiento
            LoteProducto loteProducto = null;

            boolean tieneLote = item.getLote() != null
                    && !item.getLote().isBlank();

            if (tieneLote || item.getFechaVencimiento() != null) {

                String codigo = tieneLote
                        ? item.getLote()
                        : "SIN-LOTE-" + detalleGuardado.getIdDetalleCompra();

                loteProducto = new LoteProducto();
                loteProducto.setProducto(producto);
                loteProducto.setDetalleCompra(detalleGuardado);
                loteProducto.setCodigoLote(codigo);
                loteProducto.setFechaIngreso(LocalDate.now());
                loteProducto.setFechaVencimiento(
                        item.getFechaVencimiento());
                loteProducto.setCantidadInicial(item.getCantidad());
                loteProducto.setCantidadDisponible(item.getCantidad());

                loteProductoRepository.save(loteProducto);
            }

            // Registrar movimiento Kardex
            MovimientoInventario movimiento =
                    new MovimientoInventario();

            movimiento.setProducto(producto);
            movimiento.setLote(loteProducto);
            movimiento.setTipo("ENTRADA");
            movimiento.setCantidad(item.getCantidad());
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockNuevo(stockNuevo);
            movimiento.setMotivo(
                    "Entrada por compra #" + compraGuardada.getIdCompra());
            movimiento.setReferenciaTipo("COMPRA");
            movimiento.setReferenciaId(compraGuardada.getIdCompra());
            movimiento.setUsuario(administrador.getUsuario());

            movimientoRepository.save(movimiento);

            subtotalTotal = subtotalTotal.add(subtotal);
        }

        // Calcular totales
        BigDecimal iva = subtotalTotal.multiply(IVA_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        compraGuardada.setSubtotal(subtotalTotal);
        compraGuardada.setIva(iva);
        compraGuardada.setTotal(subtotalTotal.add(iva));

        return compraRepository.save(compraGuardada);
    }

    // Métodos anteriores conservados

    public Compra guardarCompra(Compra compra) {
        return compraRepository.save(compra);
    }

    public List<Compra> listarCompras() {
        return compraRepository.findAll();
    }

    public Compra buscarCompra(Integer id) {
        return compraRepository.findById(id).orElse(null);
    }

    public void eliminarCompra(Integer id) {
        compraRepository.deleteById(id);
    }

    public DetalleCompra guardarDetalle(DetalleCompra detalle) {
        return detalleCompraRepository.save(detalle);
    }

    public List<DetalleCompra> listarDetalles() {
        return detalleCompraRepository.findAll();
    }
}
