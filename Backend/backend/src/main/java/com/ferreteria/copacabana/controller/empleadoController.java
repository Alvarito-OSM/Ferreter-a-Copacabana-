package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.empleado;
import com.ferreteria.copacabana.service.empleadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class empleadoController {

    @Autowired
    private empleadoService empleadoService;

    @GetMapping
    public List<empleado> listar() {
        return empleadoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<empleado> buscar(@PathVariable Integer id) {
        return empleadoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public empleado crear(@RequestBody empleado empleado) {
        return empleadoService.guardar(empleado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<empleado> actualizar(@PathVariable Integer id, @RequestBody empleado empleado) {
        return empleadoService.buscarPorId(id)
                .map(e -> {
                    empleado.setIdEmpleado(id);
                    return ResponseEntity.ok(empleadoService.guardar(empleado));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        empleadoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}