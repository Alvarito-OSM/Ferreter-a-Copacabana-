package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.dto.ProveedorResumenResponse;
import com.ferreteria.copacabana.service.ProveedorResumenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorResumenController {

    private final ProveedorResumenService resumenService;

    public ProveedorResumenController(ProveedorResumenService resumenService) {
        this.resumenService = resumenService;
    }

    @GetMapping("/{id}/resumen")
    public ResponseEntity<ProveedorResumenResponse> resumen(@PathVariable Integer id) {
        return resumenService.obtenerResumen(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
