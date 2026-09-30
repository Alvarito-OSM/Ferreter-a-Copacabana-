package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Pago;
import com.ferreteria.copacabana.service.PagoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @GetMapping
    public ResponseEntity<List<Pago>> listarTodos() {
        return ResponseEntity.ok(pagoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pago> buscarPorId(@PathVariable Integer id) {
        return pagoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/venta/{idVenta}")
    public ResponseEntity<List<Pago>> buscarPorVenta(
            @PathVariable Integer idVenta) {
        return ResponseEntity.ok(pagoService.buscarPorVenta(idVenta));
    }

    @PostMapping
    public ResponseEntity<Pago> registrar(@RequestBody Pago pago) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(pagoService.registrar(pago));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pago> actualizar(
            @PathVariable Integer id,
            @RequestBody Pago pago) {
        return ResponseEntity.ok(
                pagoService.actualizar(id, pago)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        pagoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}