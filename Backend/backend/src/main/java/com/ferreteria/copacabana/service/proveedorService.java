package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.proveedor;
import com.ferreteria.copacabana.repository.proveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class proveedorService {

    @Autowired
    private proveedorRepository proveedorRepository;

    public List<proveedor> listarTodos() {
        return proveedorRepository.findAll();
    }

    public Optional<proveedor> buscarPorId(Integer id) {
        return proveedorRepository.findById(id);
    }

    public proveedor guardar(proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    public void eliminar(Integer id) {
        proveedorRepository.deleteById(id);
    }
}