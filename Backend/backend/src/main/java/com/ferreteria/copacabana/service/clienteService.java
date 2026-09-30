package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.cliente;
import com.ferreteria.copacabana.repository.clienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class clienteService {

    @Autowired
    private clienteRepository clienteRepository;

    public List<cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Optional<cliente> buscarPorId(Integer id) {
        return clienteRepository.findById(id);
    }

    public cliente guardar(cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public void eliminar(Integer id) {
        clienteRepository.deleteById(id);
    }
}