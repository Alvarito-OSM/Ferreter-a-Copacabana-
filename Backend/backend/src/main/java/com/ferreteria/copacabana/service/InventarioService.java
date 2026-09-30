package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.Inventario;
import com.ferreteria.copacabana.repository.InventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventarioService {

    @Autowired
    private InventarioRepository inventarioRepository;

    public List<Inventario> listarTodos() {
        return inventarioRepository.findAll();
    }

    public Optional<Inventario> buscarPorId(Integer id) {
        return inventarioRepository.findById(id);
    }

    public Optional<Inventario> buscarPorProducto(Integer idProducto) {
        return inventarioRepository.findByProductoIdProducto(idProducto);
    }

    public List<Inventario> listarStockBajo() {
        return inventarioRepository.findByStockActualLessThanEqual(5);
    }

    public Inventario guardar(Inventario inventario) {
        return inventarioRepository.save(inventario);
    }

    public void eliminar(Integer id) {
        inventarioRepository.deleteById(id);
    }
}