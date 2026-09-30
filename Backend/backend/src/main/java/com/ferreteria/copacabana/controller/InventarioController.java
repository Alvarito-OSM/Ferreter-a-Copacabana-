package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Inventario;
import com.ferreteria.copacabana.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;

    @GetMapping
    public List<Inventario> listar() {
        return inventarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventario> buscar(@PathVariable Integer id) {
        return inventarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<Inventario> buscarPorProducto(@PathVariable Integer idProducto) {
        return inventarioService.buscarPorProducto(idProducto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stock-bajo")
    public List<Inventario> listarStockBajo() {
        return inventarioService.listarStockBajo();
    }

    @PostMapping
    public Inventario crear(@RequestBody Inventario inventario) {
        return inventarioService.guardar(inventario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inventario> actualizar(@PathVariable Integer id, @RequestBody Inventario inventario) {
        return inventarioService.buscarPorId(id)
                .map(i -> {
                    inventario.setIdInventario(id);
                    return ResponseEntity.ok(inventarioService.guardar(inventario));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        inventarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}