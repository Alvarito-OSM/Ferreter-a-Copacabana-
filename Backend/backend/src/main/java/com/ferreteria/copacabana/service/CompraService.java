package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.Compra;
import com.ferreteria.copacabana.model.DetalleCompra;
import com.ferreteria.copacabana.repository.CompraRepository;
import com.ferreteria.copacabana.repository.DetalleCompraRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final DetalleCompraRepository detalleCompraRepository;

    public CompraService(CompraRepository compraRepository,
                         DetalleCompraRepository detalleCompraRepository) {
        this.compraRepository = compraRepository;
        this.detalleCompraRepository = detalleCompraRepository;
    }

    public Compra guardarCompra(Compra compra) {
        return compraRepository.save(compra);
    }

    public List<Compra> listarCompras() {
        return compraRepository.findAll();
    }

    public Compra buscarCompra(Integer id) {
        return compraRepository.findById(id).orElse(null);
    }

    public void eliminarCompra(Integer id) {
        compraRepository.deleteById(id);
    }

    public DetalleCompra guardarDetalle(DetalleCompra detalle) {
        return detalleCompraRepository.save(detalle);
    }

    public List<DetalleCompra> listarDetalles() {
        return detalleCompraRepository.findAll();
    }
}
