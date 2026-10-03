package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.Administrador;
import com.ferreteria.copacabana.model.Empleado;
import com.ferreteria.copacabana.repository.AdministradorRepository;
import com.ferreteria.copacabana.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AdministradorRepository administradorRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // 1. Buscar en administrador
        Optional<Administrador> adminOpt = administradorRepository.findByUsuario(username);
        if (adminOpt.isPresent()) {
            Administrador admin = adminOpt.get();
            return new User(
                    admin.getUsuario(),
                    admin.getContrasena(),
                    admin.getEstado(),
                    true,
                    true,
                    true,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR"))
            );
        }

        // 2. Buscar en empleado
        Optional<Empleado> empOpt = empleadoRepository.findByUsuario(username);
        if (empOpt.isPresent()) {
            Empleado emp = empOpt.get();
            return new User(
                    emp.getUsuario(),
                    emp.getContrasena(),
                    emp.getEstado(),
                    true,
                    true,
                    true,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_EMPLEADO"))
            );
        }

        // 3. No encontrado
        throw new UsernameNotFoundException("Usuario no encontrado: " + username);
    }
}