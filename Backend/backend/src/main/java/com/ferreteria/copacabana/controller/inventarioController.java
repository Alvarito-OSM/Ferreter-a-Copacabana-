package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.inventario;
import com.ferreteria.copacabana.service.inventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class inventarioController {

    @Autowired
    private inventarioService inventarioService;

    @GetMapping
    public List<inventario> listar() {
        return inventarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<inventario> buscar(@PathVariable Integer id) {
        return inventarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<inventario> buscarPorProducto(@PathVariable Integer idProducto) {
        return inventarioService.buscarPorProducto(idProducto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stock-bajo")
    public List<inventario> listarStockBajo() {
        return inventarioService.listarStockBajo();
    }

    @PostMapping
    public inventario crear(@RequestBody inventario inventario) {
        return inventarioService.guardar(inventario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<inventario> actualizar(@PathVariable Integer id, @RequestBody inventario inventario) {
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