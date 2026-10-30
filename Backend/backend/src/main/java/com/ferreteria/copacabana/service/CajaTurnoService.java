
package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.dto.*;
import com.ferreteria.copacabana.model.*;
import com.ferreteria.copacabana.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CajaTurnoService {

    private final CajaTurnoRepository cajaRepository;
    private final MovimientoCajaRepository movimientoRepository;
    private final EmpleadoRepository empleadoRepository;

    private static final String ABIERTA = "ABIERTA";
    private static final String CERRADA = "CERRADA";

    public CajaTurnoService(
            CajaTurnoRepository cajaRepository,
            MovimientoCajaRepository movimientoRepository,
            EmpleadoRepository empleadoRepository) {
        this.cajaRepository = cajaRepository;
        this.movimientoRepository = movimientoRepository;
        this.empleadoRepository = empleadoRepository;
    }

    @Transactional
    public CajaTurno abrir(AperturaCajaRequest request) {

        if (request.getIdEmpleado() == null ||
                request.getMontoInicial() == null ||
                request.getMontoInicial().signum() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Empleado y monto inicial válido son obligatorios");
        }

        Empleado empleado = empleadoRepository
                .findById(request.getIdEmpleado())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Empleado no encontrado"));

        if (!Boolean.TRUE.equals(empleado.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El empleado está inactivo");
        }

        if (cajaRepository
                .findFirstByIdEmpleadoAndEstadoOrderByFechaAperturaDesc(
                        request.getIdEmpleado(), ABIERTA).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El empleado ya tiene un turno abierto");
        }

        CajaTurno turno = new CajaTurno();
        turno.setIdEmpleado(request.getIdEmpleado());
        turno.setFechaApertura(LocalDateTime.now());
        turno.setMontoInicial(request.getMontoInicial());
        turno.setEstado(ABIERTA);
        turno.setObservacionApertura(request.getObservacionApertura());

        return cajaRepository.save(turno);
    }

    @Transactional
    public MovimientoCaja registrarMovimiento(
            Integer idTurno,
            MovimientoCajaRequest request) {

        CajaTurno turno = obtenerTurnoAbierto(idTurno);

        if (request.getMonto() == null ||
                request.getMonto().signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto debe ser mayor a cero");
        }

        if (request.getConcepto() == null ||
                request.getConcepto().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El concepto es obligatorio");
        }

        String tipo = request.getTipo() == null
                ? ""
                : request.getTipo().trim().toUpperCase();

        if (!tipo.equals("ENTRADA") && !tipo.equals("SALIDA")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El tipo debe ser ENTRADA o SALIDA");
        }

        BigDecimal disponible = calcularEfectivoEsperado(turno);

        if (tipo.equals("SALIDA") &&
                request.getMonto().compareTo(disponible) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El efectivo disponible es insuficiente");
        }

        MovimientoCaja movimiento = new MovimientoCaja();
        movimiento.setIdTurno(idTurno);
        movimiento.setTipo(tipo);
        movimiento.setConcepto(request.getConcepto().trim());
        movimiento.setMonto(request.getMonto());
        movimiento.setFecha(LocalDateTime.now());

        return movimientoRepository.save(movimiento);
    }

    @Transactional
    public CajaTurno cerrar(
            Integer idTurno,
            CierreCajaRequest request) {

        CajaTurno turno = obtenerTurnoAbierto(idTurno);

        if (request.getMontoContado() == null ||
                request.getMontoContado().signum() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto contado debe ser válido");
        }

        BigDecimal esperado = calcularEfectivoEsperado(turno);

        turno.setFechaCierre(LocalDateTime.now());
        turno.setMontoEsperado(esperado);
        turno.setMontoContado(request.getMontoContado());
        turno.setDiferencia(
                request.getMontoContado().subtract(esperado));
        turno.setObservacionCierre(request.getObservacionCierre());
        turno.setEstado(CERRADA);

        return cajaRepository.save(turno);
    }

    public CajaTurno obtenerTurnoAbiertoEmpleado(Integer idEmpleado) {
        return cajaRepository
                .findFirstByIdEmpleadoAndEstadoOrderByFechaAperturaDesc(
                        idEmpleado, ABIERTA)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El empleado no tiene un turno abierto"));
    }

    public List<CajaTurno> listarTurnos() {
        return cajaRepository.findAllByOrderByFechaAperturaDesc();
    }

    public List<MovimientoCaja> listarMovimientos(Integer idTurno) {
        if (!cajaRepository.existsById(idTurno)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Turno no encontrado");
        }

        return movimientoRepository
                .findByIdTurnoOrderByFechaDesc(idTurno);
    }

    private CajaTurno obtenerTurnoAbierto(Integer idTurno) {
        CajaTurno turno = cajaRepository.buscarBloqueado(idTurno)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Turno no encontrado"));

        if (!ABIERTA.equals(turno.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El turno ya está cerrado");
        }

        return turno;
    }

    private BigDecimal calcularEfectivoEsperado(CajaTurno turno) {

        BigDecimal esperado = turno.getMontoInicial();

        List<MovimientoCaja> movimientos =
                movimientoRepository.findByIdTurnoOrderByFechaDesc(
                        turno.getIdTurno());

        for (MovimientoCaja movimiento : movimientos) {

            if ("ENTRADA".equalsIgnoreCase(movimiento.getTipo())) {
                esperado = esperado.add(movimiento.getMonto());
            } else if ("SALIDA".equalsIgnoreCase(movimiento.getTipo())) {
                esperado = esperado.subtract(movimiento.getMonto());
            }
        }

        return esperado;
    }
}
