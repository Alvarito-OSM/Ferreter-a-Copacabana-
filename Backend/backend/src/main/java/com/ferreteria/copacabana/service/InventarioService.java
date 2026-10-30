
package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.dto.AjusteInventarioRequest;
import com.ferreteria.copacabana.model.*;
import com.ferreteria.copacabana.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Locale;

@Service
public class InventarioService {

    private final InventarioRepository inventarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public InventarioService(
            InventarioRepository inventarioRepository,
            MovimientoInventarioRepository movimientoRepository) {
        this.inventarioRepository = inventarioRepository;
        this.movimientoRepository = movimientoRepository;
    }

    public List<Inventario> listarTodos() {
        return inventarioRepository.findAll();
    }

    public Optional<Inventario> buscarPorId(Integer id) {
        return inventarioRepository.findById(id);
    }

    public Optional<Inventario> buscarPorProducto(Integer idProducto) {
        return inventarioRepository.findByProductoIdProducto(idProducto);
    }

    public List<Inventario> listarStockBajo() {
        return inventarioRepository.buscarStockBajo();
    }

    @Transactional
    public MovimientoInventario ajustarStock(
            AjusteInventarioRequest request,
            String usuario) {

        if (request.getIdProducto() == null ||
                request.getCantidad() == null ||
                request.getCantidad() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Producto y cantidad válida son obligatorios");
        }

        if (request.getMotivo() == null ||
                request.getMotivo().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el motivo del ajuste");
        }

        String tipo = request.getTipo() == null
                ? ""
                : request.getTipo().trim().toUpperCase(Locale.ROOT);

        if (!tipo.equals("ENTRADA") && !tipo.equals("SALIDA")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El tipo debe ser ENTRADA o SALIDA");
        }

        Inventario inventario = inventarioRepository
                .buscarPorProductoBloqueado(request.getIdProducto())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No existe inventario para este producto"));

        int anterior = inventario.getStockActual();

        int nuevo = tipo.equals("ENTRADA")
                ? anterior + request.getCantidad()
                : anterior - request.getCantidad();

        if (nuevo < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No hay suficiente stock para realizar la salida");
        }

        inventario.setStockActual(nuevo);
        inventario.setFechaActualizacion(LocalDateTime.now());

        inventarioRepository.save(inventario);

        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setProducto(inventario.getProducto());
        movimiento.setLote(null);
        movimiento.setTipo(
                tipo.equals("ENTRADA")
                        ? "AJUSTE_ENTRADA"
                        : "AJUSTE_SALIDA");
        movimiento.setCantidad(request.getCantidad());
        movimiento.setStockAnterior(anterior);
        movimiento.setStockNuevo(nuevo);
        movimiento.setMotivo(request.getMotivo().trim());
        movimiento.setReferenciaTipo("AJUSTE");
        movimiento.setReferenciaId(null);
        movimiento.setUsuario(usuario);

        return movimientoRepository.save(movimiento);
    }

    public Inventario guardar(Inventario inventario) {
        return inventarioRepository.save(inventario);
    }

    public void eliminar(Integer id) {
        inventarioRepository.deleteById(id);
    }
}
