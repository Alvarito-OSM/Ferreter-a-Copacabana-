package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.inventario;
import com.ferreteria.copacabana.repository.inventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class inventarioService {

    @Autowired
    private inventarioRepository inventarioRepository;

    public List<inventario> listarTodos() {
        return inventarioRepository.findAll();
    }

    public Optional<inventario> buscarPorId(Integer id) {
        return inventarioRepository.findById(id);
    }

    public Optional<inventario> buscarPorProducto(Integer idProducto) {
        return inventarioRepository.findByProductoIdProducto(idProducto);
    }

    public List<inventario> listarStockBajo() {
        return inventarioRepository.findByStockActualLessThanEqual(5);
    }

    public inventario guardar(inventario inventario) {
        return inventarioRepository.save(inventario);
    }

    public void eliminar(Integer id) {
        inventarioRepository.deleteById(id);
    }
}