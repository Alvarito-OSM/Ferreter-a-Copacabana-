package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Compra;
import com.ferreteria.copacabana.model.DetalleCompra;
import com.ferreteria.copacabana.service.CompraService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "*")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @PostMapping
    public Compra guardarCompra(@RequestBody Compra compra) {
        return compraService.guardarCompra(compra);
    }

    @GetMapping
    public List<Compra> listarCompras() {
        return compraService.listarCompras();
    }

    @GetMapping("/{id}")
    public Compra buscarCompra(@PathVariable Integer id) {
        return compraService.buscarCompra(id);
    }

    @DeleteMapping("/{id}")
    public String eliminarCompra(@PathVariable Integer id) {
        compraService.eliminarCompra(id);
        return "Compra eliminada correctamente";
    }

    @PostMapping("/detalle")
    public DetalleCompra guardarDetalle(@RequestBody DetalleCompra detalle) {
        return compraService.guardarDetalle(detalle);
    }

    @GetMapping("/detalles")
    public List<DetalleCompra> listarDetalles() {
        return compraService.listarDetalles();
    }
}
