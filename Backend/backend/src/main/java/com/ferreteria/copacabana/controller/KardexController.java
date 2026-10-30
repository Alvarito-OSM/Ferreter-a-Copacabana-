
package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.MovimientoInventario;
import com.ferreteria.copacabana.repository.MovimientoInventarioRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kardex")
@CrossOrigin(origins = "*")
public class KardexController {

    private final MovimientoInventarioRepository movimientoRepository;

    public KardexController(
            MovimientoInventarioRepository movimientoRepository) {
        this.movimientoRepository = movimientoRepository;
    }

    @GetMapping
    public List<MovimientoInventario> listar() {
        return movimientoRepository.findTop100ByOrderByFechaDesc();
    }

    @GetMapping("/producto/{idProducto}")
    public List<MovimientoInventario> listarPorProducto(
            @PathVariable Integer idProducto) {

        return movimientoRepository
                .findTop100ByProductoIdProductoOrderByFechaDesc(idProducto);
    }
}
