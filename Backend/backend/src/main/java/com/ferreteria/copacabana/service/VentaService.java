package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.dto.DetalleVentaRequest;
import com.ferreteria.copacabana.dto.VentaRequest;
import com.ferreteria.copacabana.model.DetalleVenta;
import com.ferreteria.copacabana.model.Inventario;
import com.ferreteria.copacabana.model.Producto;
import com.ferreteria.copacabana.model.Venta;
import com.ferreteria.copacabana.repository.DetalleVentaRepository;
import com.ferreteria.copacabana.repository.InventarioRepository;
import com.ferreteria.copacabana.repository.ProductoRepository;
import com.ferreteria.copacabana.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private InventarioRepository inventarioRepository;

    private static final BigDecimal IVA_RATE = new BigDecimal("0.13");

    public List<Venta> listarTodas() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> buscarPorId(Integer id) {
        return ventaRepository.findById(id);
    }

    public List<DetalleVenta> listarDetalles(Integer idVenta) {
        return detalleVentaRepository.findByIdVenta(idVenta);
    }

    public List<DetalleVenta> listarTodosLosDetalles() {
        return detalleVentaRepository.findAll();
    }

    @Transactional
    public Venta registrarVenta(VentaRequest request) {

        // 1. Validar que haya detalles
        if (request.getDetalles() == null || request.getDetalles().isEmpty()) {
            throw new RuntimeException("La venta debe tener al menos un producto");
        }

        // 2. Validar stock de TODOS los productos ANTES de vender
        for (DetalleVentaRequest detalle : request.getDetalles()) {
            Optional<Inventario> invOpt = inventarioRepository.findByProductoIdProducto(detalle.getIdProducto());
            if (invOpt.isEmpty()) {
                throw new RuntimeException("No existe inventario para el producto con ID " + detalle.getIdProducto());
            }

            Inventario inv = invOpt.get();
            if (inv.getStockActual() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto ID " + detalle.getIdProducto() +
                        ". Disponible: " + inv.getStockActual() + ", solicitado: " + detalle.getCantidad());
            }
        }

        // 3. Crear la venta
        Venta venta = new Venta();
        venta.setIdCliente(request.getIdCliente());
        venta.setIdEmpleado(request.getIdEmpleado());
        venta.setFecha(LocalDateTime.now());
        venta.setEstado("COMPLETADA");
        venta.setDescuento(BigDecimal.ZERO);

        // 4. Guardar venta temporal para obtener el ID
        Venta ventaGuardada = ventaRepository.save(venta);

        // 5. Crear los detalles y calcular totales
        List<DetalleVenta> detalles = new ArrayList<>();
        BigDecimal subtotalTotal = BigDecimal.ZERO;

        for (DetalleVentaRequest detReq : request.getDetalles()) {
            Producto producto = productoRepository.findById(detReq.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detReq.getIdProducto()));

            BigDecimal precioUnitario = producto.getPrecioVenta();
            BigDecimal subtotalLinea = precioUnitario.multiply(BigDecimal.valueOf(detReq.getCantidad()));

            DetalleVenta detalle = new DetalleVenta();
            detalle.setIdVenta(ventaGuardada.getIdVenta());
            detalle.setIdProducto(detReq.getIdProducto());
            detalle.setCantidad(detReq.getCantidad());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setDescuento(BigDecimal.ZERO);
            detalle.setSubtotal(subtotalLinea);

            detalles.add(detalle);
            subtotalTotal = subtotalTotal.add(subtotalLinea);

            // 6. Descontar stock del inventario
            Optional<Inventario> invOpt = inventarioRepository.findByProductoIdProducto(detReq.getIdProducto());
            if (invOpt.isPresent()) {
                Inventario inv = invOpt.get();
                inv.setStockActual(inv.getStockActual() - detReq.getCantidad());
                inv.setFechaActualizacion(LocalDateTime.now());
                inventarioRepository.save(inv);
            }
        }

        // 7. Guardar los detalles
        detalleVentaRepository.saveAll(detalles);

        // 8. Calcular IVA y total
        BigDecimal iva = subtotalTotal.multiply(IVA_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotalTotal.add(iva);

        // 9. Actualizar la venta con los totales
        ventaGuardada.setSubtotal(subtotalTotal);
        ventaGuardada.setIva(iva);
        ventaGuardada.setTotal(total);

        return ventaRepository.save(ventaGuardada);
    }

    @Transactional
    public Venta anularVenta(Integer idVenta) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada: " + idVenta));

        if ("ANULADA".equals(venta.getEstado())) {
            throw new RuntimeException("La venta ya está anulada");
        }

        // Devolver stock al inventario
        List<DetalleVenta> detalles = detalleVentaRepository.findByIdVenta(idVenta);
        for (DetalleVenta detalle : detalles) {
            Optional<Inventario> invOpt = inventarioRepository.findByProductoIdProducto(detalle.getIdProducto());
            if (invOpt.isPresent()) {
                Inventario inv = invOpt.get();
                inv.setStockActual(inv.getStockActual() + detalle.getCantidad());
                inv.setFechaActualizacion(LocalDateTime.now());
                inventarioRepository.save(inv);
            }
        }

        venta.setEstado("ANULADA");
        return ventaRepository.save(venta);
    }
}