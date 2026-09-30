package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.cliente;
import com.ferreteria.copacabana.service.clienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class clienteController {

    @Autowired
    private clienteService clienteService;

    @GetMapping
    public List<cliente> listar() {
        return clienteService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<cliente> buscar(@PathVariable Integer id) {
        return clienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public cliente crear(@RequestBody cliente nuevoCliente) {
        return clienteService.guardar(nuevoCliente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<cliente> actualizar(@PathVariable Integer id, @RequestBody cliente nuevoCliente) {
        return clienteService.buscarPorId(id)
                .map(c -> {
                    nuevoCliente.setIdCliente(id);
                    return ResponseEntity.ok(clienteService.guardar(nuevoCliente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        clienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}