package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.Pago;
import com.ferreteria.copacabana.repository.PagoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;

    public PagoService(PagoRepository pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    public List<Pago> listarTodos() {
        return pagoRepository.findAll();
    }

    public Optional<Pago> buscarPorId(Integer id) {
        return pagoRepository.findById(id);
    }

    public List<Pago> buscarPorVenta(Integer idVenta) {
        return pagoRepository.findByIdVenta(idVenta);
    }

    public Pago registrar(Pago pago) {
        if (pago.getFecha() == null) {
            pago.setFecha(LocalDateTime.now());
        }

        return pagoRepository.save(pago);
    }

    public Pago actualizar(Integer id, Pago datos) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));

        pago.setIdVenta(datos.getIdVenta());
        pago.setMetodo(datos.getMetodo());
        pago.setMonto(datos.getMonto());

        return pagoRepository.save(pago);
    }

    public void eliminar(Integer id) {
        if (!pagoRepository.existsById(id)) {
            throw new RuntimeException("Pago no encontrado");
        }

        pagoRepository.deleteById(id);
    }
}