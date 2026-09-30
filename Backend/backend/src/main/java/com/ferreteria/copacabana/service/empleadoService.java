package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.empleado;
import com.ferreteria.copacabana.repository.empleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class empleadoService {

    @Autowired
    private empleadoRepository empleadoRepository;

    public List<empleado> listarTodos() {
        return empleadoRepository.findAll();
    }

    public Optional<empleado> buscarPorId(Integer id) {
        return empleadoRepository.findById(id);
    }

    public empleado guardar(empleado empleado) {
        return empleadoRepository.save(empleado);
    }

    public void eliminar(Integer id) {
        empleadoRepository.deleteById(id);
    }
}