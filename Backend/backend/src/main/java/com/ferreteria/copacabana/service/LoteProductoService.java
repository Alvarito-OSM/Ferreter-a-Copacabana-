
package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.LoteProducto;
import com.ferreteria.copacabana.repository.LoteProductoRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoteProductoService {

    private final LoteProductoRepository loteRepository;

    public LoteProductoService(LoteProductoRepository loteRepository) {
        this.loteRepository = loteRepository;
    }

    public List<LoteProducto> listarTodos() {
        return loteRepository.findAll();
    }

    public List<LoteProducto> proximosAVencer(int dias) {

        if (dias < 0 || dias > 3650) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El rango debe estar entre 0 y 3650 días");
        }

        LocalDate hoy = LocalDate.now();

        return loteRepository
                .findByFechaVencimientoIsNotNullAndFechaVencimientoBetweenOrderByFechaVencimientoAsc(
                        hoy, hoy.plusDays(dias));
    }

    public List<LoteProducto> vencidos() {
        return loteRepository
                .findByFechaVencimientoIsNotNullAndFechaVencimientoBeforeOrderByFechaVencimientoAsc(
                        LocalDate.now());
    }
}
