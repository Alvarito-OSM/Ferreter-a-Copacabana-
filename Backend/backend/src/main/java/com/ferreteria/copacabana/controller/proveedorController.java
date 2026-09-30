package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.proveedor;
import com.ferreteria.copacabana.service.proveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
public class proveedorController {

    @Autowired
    private proveedorService proveedorService;

    @GetMapping
    public List<proveedor> listar() {
        return proveedorService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<proveedor> buscar(@PathVariable Integer id) {
        return proveedorService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public proveedor crear(@RequestBody proveedor nuevoProveedor) {
        return proveedorService.guardar(nuevoProveedor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<proveedor> actualizar(@PathVariable Integer id, @RequestBody proveedor nuevoProveedor) {
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