package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.Empleado;
import com.ferreteria.copacabana.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmpleadoService {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Empleado> listarTodos() {
        return empleadoRepository.findAll();
    }

    public Optional<Empleado> buscarPorId(Integer id) {
        return empleadoRepository.findById(id);
    }

    public Empleado guardar(Empleado empleado) {
        empleado.setContrasena(resolverContrasena(empleado));
        return empleadoRepository.save(empleado);
    }

    private String resolverContrasena(Empleado empleado) {
        String contrasena = empleado.getContrasena();

        if (contrasena == null || contrasena.isBlank()) {
            return empleado.getIdEmpleado() == null
                    ? contrasena
                    : empleadoRepository.findById(empleado.getIdEmpleado())
                            .map(Empleado::getContrasena)
                            .orElse(contrasena);
        }

        return contrasena.startsWith("$2") ? contrasena : passwordEncoder.encode(contrasena);
    }

    public void eliminar(Integer id) {
        empleadoRepository.deleteById(id);
    }
}