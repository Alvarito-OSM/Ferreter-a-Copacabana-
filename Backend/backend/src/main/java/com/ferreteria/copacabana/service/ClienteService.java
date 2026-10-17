package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.Cliente;
import com.ferreteria.copacabana.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> buscarPorId(Integer id) {
        return clienteRepository.findById(id);
    }

    public Cliente guardar(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public void eliminar(Integer id) {
        clienteRepository.deleteById(id);
    }

    public List<Cliente> buscar(String texto) {
        List<Cliente> clientes = listarTodos();

        if (texto == null || texto.isBlank()) {
            return clientes;
        }

        String filtro = texto.trim().toLowerCase(Locale.ROOT);

        return clientes.stream()
                .filter(cliente ->
                        contiene(cliente.getNombre(), filtro)
                        || contiene(cliente.getApellido(), filtro)
                        || contiene(cliente.getCedulaNit(), filtro))
                .toList();
    }

    private boolean contiene(String valor, String filtro) {
        return valor != null
                && valor.toLowerCase(Locale.ROOT).contains(filtro);
    }
}