package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.producto;
import com.ferreteria.copacabana.repository.productoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class productosService {

    @Autowired
    private productoRepository productoRepository;

    public List<producto> listarTodos() {
        return productoRepository.findAll();
    }

    public Optional<producto> buscarPorId(Integer id) {
        return productoRepository.findById(id);
    }

    public List<producto> buscarPorCategoria(Integer idCategoria) {
        return productoRepository.findByCategoriaIdCategoria(idCategoria);
    }

    public List<producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public producto guardar(producto producto) {
        return productoRepository.save(producto);
    }

    public void eliminar(Integer id) {
        productoRepository.deleteById(id);
    }
}