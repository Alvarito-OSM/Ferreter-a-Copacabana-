
package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.LoteProducto;
import com.ferreteria.copacabana.service.LoteProductoService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")
@CrossOrigin(origins = "*")
public class LoteProductoController {

    private final LoteProductoService loteService;

    public LoteProductoController(LoteProductoService loteService) {
        this.loteService = loteService;
    }

    @GetMapping
    public List<LoteProducto> listar() {
        return loteService.listarTodos();
    }

    @GetMapping("/proximos-vencer")
    public List<LoteProducto> proximosAVencer(
            @RequestParam(defaultValue = "30") int dias) {
        return loteService.proximosAVencer(dias);
    }

    @GetMapping("/vencidos")
    public List<LoteProducto> vencidos() {
        return loteService.vencidos();
    }
}
