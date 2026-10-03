package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.dto.VentaRequest;
import com.ferreteria.copacabana.model.DetalleVenta;
import com.ferreteria.copacabana.model.Venta;
import com.ferreteria.copacabana.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @GetMapping
    public List<Venta> listar() {
        return ventaService.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> buscar(@PathVariable Integer id) {
        return ventaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/detalles")
    public List<DetalleVenta> listarDetalles(@PathVariable Integer id) {
        return ventaService.listarDetalles(id);
    }

    @GetMapping("/detalles")
    public List<DetalleVenta> listarTodosLosDetalles() {
        return ventaService.listarTodosLosDetalles();
    }

    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody VentaRequest request) {
        try {
            Venta venta = ventaService.registrarVenta(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(venta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/anular")
    public ResponseEntity<?> anular(@PathVariable Integer id) {
        try {
            Venta venta = ventaService.anularVenta(id);
            return ResponseEntity.ok(venta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}