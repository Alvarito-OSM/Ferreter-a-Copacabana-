package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.categoria;
import com.ferreteria.copacabana.service.categoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class categoriaController {

    @Autowired
    private categoriaService categoriaService;

    @GetMapping
    public List<categoria> listar() {
        return categoriaService.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<categoria> buscar(@PathVariable Integer id) {
        return categoriaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public categoria crear(@RequestBody categoria categoria) {
        return categoriaService.guardar(categoria);
    }

    @PutMapping("/{id}")
    public ResponseEntity<categoria> actualizar(@PathVariable Integer id, @RequestBody categoria categoria) {
        return categoriaService.buscarPorId(id)
                .map(c -> {
                    categoria.setIdCategoria(id);
                    return ResponseEntity.ok(categoriaService.guardar(categoria));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}