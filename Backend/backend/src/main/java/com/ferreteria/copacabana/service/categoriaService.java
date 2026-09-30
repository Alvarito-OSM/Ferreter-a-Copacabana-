package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.categoria;
import com.ferreteria.copacabana.repository.categoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class categoriaService {

    @Autowired
    private categoriaRepository categoriaRepository;

    public List<categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    public Optional<categoria> buscarPorId(Integer id) {
        return categoriaRepository.findById(id);
    }

    public categoria guardar(categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public void eliminar(Integer id) {
        categoriaRepository.deleteById(id);
    }
}