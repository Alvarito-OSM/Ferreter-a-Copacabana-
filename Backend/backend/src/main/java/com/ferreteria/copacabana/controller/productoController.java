package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.producto;
import com.ferreteria.copacabana.service.productosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class productoController {

    @Autowired
    private productosService productosService;

    @GetMapping
    public List<producto> listar() {
        return productosService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<producto> buscar(@PathVariable Integer id) {
        return productosService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categoria/{idCategoria}")
    public List<producto> buscarPorCategoria(@PathVariable Integer idCategoria) {
        return productosService.buscarPorCategoria(idCategoria);
    }

    @GetMapping("/buscar")
    public List<producto> buscarPorNombre(@RequestParam String nombre) {
        return productosService.buscarPorNombre(nombre);
    }

    @PostMapping
    public producto crear(@RequestBody producto producto) {
        return productosService.guardar(producto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<producto> actualizar(@PathVariable Integer id, @RequestBody producto producto) {
        return productosService.buscarPorId(id)
                .map(p -> {
                    producto.setIdProducto(id);
                    return ResponseEntity.ok(productosService.guardar(producto));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        productosService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}