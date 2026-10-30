
package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.dto.*;
import com.ferreteria.copacabana.model.*;
import com.ferreteria.copacabana.service.CajaTurnoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caja")
@CrossOrigin(origins = "*")
public class CajaTurnoController {

    private final CajaTurnoService cajaService;

    public CajaTurnoController(CajaTurnoService cajaService) {
        this.cajaService = cajaService;
    }

    @PostMapping("/abrir")
    public ResponseEntity<CajaTurno> abrir(
            @RequestBody AperturaCajaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cajaService.abrir(request));
    }

    @PostMapping("/{idTurno}/movimientos")
    public ResponseEntity<MovimientoCaja> registrarMovimiento(
            @PathVariable Integer idTurno,
            @RequestBody MovimientoCajaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cajaService.registrarMovimiento(idTurno, request));
    }

    @PostMapping("/{idTurno}/cerrar")
    public ResponseEntity<CajaTurno> cerrar(
            @PathVariable Integer idTurno,
            @RequestBody CierreCajaRequest request) {
        return ResponseEntity.ok(cajaService.cerrar(idTurno, request));
    }

    @GetMapping("/empleado/{idEmpleado}/abierta")
    public ResponseEntity<CajaTurno> turnoAbierto(
            @PathVariable Integer idEmpleado) {
        return ResponseEntity.ok(
                cajaService.obtenerTurnoAbiertoEmpleado(idEmpleado));
    }

    @GetMapping("/{idTurno}/movimientos")
    public List<MovimientoCaja> movimientos(
            @PathVariable Integer idTurno) {
        return cajaService.listarMovimientos(idTurno);
    }

    @GetMapping
    public List<CajaTurno> listarTurnos() {
        return cajaService.listarTurnos();
    }
}
