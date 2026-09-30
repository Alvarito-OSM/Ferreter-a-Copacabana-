package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.Producto;
import com.ferreteria.copacabana.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> buscarPorId(Integer id) {
        return productoRepository.findById(id);
    }

    public List<Producto> buscarPorCategoria(Integer idCategoria) {
        return productoRepository.findByCategoriaIdCategoria(idCategoria);
    }

    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public Producto guardar(Producto producto) {
        return productoRepository.save(producto);
    }

    public void eliminar(Integer id) {
        productoRepository.deleteById(id);
    }
}