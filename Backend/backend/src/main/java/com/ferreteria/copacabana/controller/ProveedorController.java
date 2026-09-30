package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Proveedor;
import com.ferreteria.copacabana.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    @Autowired
    private ProveedorService proveedorService;

    @GetMapping
    public List<Proveedor> listar() {
        return proveedorService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> buscar(@PathVariable Integer id) {
        return proveedorService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Proveedor crear(@RequestBody Proveedor nuevoProveedor) {
        return proveedorService.guardar(nuevoProveedor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> actualizar(@PathVariable Integer id, @RequestBody Proveedor nuevoProveedor) {
        return proveedorService.buscarPorId(id)
                .map(p -> {
                    nuevoProveedor.setIdProveedor(id);
                    return ResponseEntity.ok(proveedorService.guardar(nuevoProveedor));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        proveedorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}