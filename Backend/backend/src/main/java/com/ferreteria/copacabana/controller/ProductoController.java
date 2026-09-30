package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Producto;
import com.ferreteria.copacabana.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productosService;

    @GetMapping
    public List<Producto> listar() {
        return productosService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscar(@PathVariable Integer id) {
        return productosService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categoria/{idCategoria}")
    public List<Producto> buscarPorCategoria(@PathVariable Integer idCategoria) {
        return productosService.buscarPorCategoria(idCategoria);
    }

    @GetMapping("/buscar")
    public List<Producto> buscarPorNombre(@RequestParam String nombre) {
        return productosService.buscarPorNombre(nombre);
    }

    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productosService.guardar(producto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Integer id, @RequestBody Producto producto) {
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