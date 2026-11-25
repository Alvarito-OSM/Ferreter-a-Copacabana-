package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.Administrador;
import com.ferreteria.copacabana.model.Cliente;
import com.ferreteria.copacabana.model.Empleado;
import com.ferreteria.copacabana.repository.AdministradorRepository;
import com.ferreteria.copacabana.repository.ClienteRepository;
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

    @Autowired
    private ClienteRepository clienteRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Optional<Administrador> adminOpt = administradorRepository.findByUsuario(username);
        if (adminOpt.isPresent()) {
            Administrador admin = adminOpt.get();
            System.out.println("--> LOGIN ADMIN: " + username + " | Estado: " + admin.getEstado() + " | Hash: " + admin.getContrasena());
            return new User(
                    admin.getUsuario(),
                    admin.getContrasena(),
                    admin.getEstado() != null ? admin.getEstado() : false,
                    true, true, true,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR"))
            );
        }

        Optional<Empleado> empOpt = empleadoRepository.findByUsuario(username);
        if (empOpt.isPresent()) {
            Empleado emp = empOpt.get();
            System.out.println("--> LOGIN EMPLEADO: " + username + " | Estado: " + emp.getEstado() + " | Hash: " + emp.getContrasena());
            return new User(
                    emp.getUsuario(),
                    emp.getContrasena(),
                    emp.getEstado() != null ? emp.getEstado() : false,
                    true, true, true,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_EMPLEADO"))
            );
        }

        Optional<Cliente> clienteOpt = clienteRepository.findByUsuario(username);
        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            System.out.println("--> LOGIN CLIENTE: " + username + " | Estado: " + cliente.getEstado() + " | Hash: " + cliente.getContrasena());
            return new User(
                    cliente.getUsuario(),
                    cliente.getContrasena(),
                    cliente.getEstado() != null ? cliente.getEstado() : false,
                    true, true, true,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_CLIENTE"))
            );
        }

        System.out.println("--> ERROR: Usuario no encontrado en la BD: " + username);
        throw new UsernameNotFoundException("Usuario no encontrado: " + username);
    }

    public boolean existeUsuario(String usuario) {
        return administradorRepository.findByUsuario(usuario).isPresent()
                || empleadoRepository.findByUsuario(usuario).isPresent()
                || clienteRepository.findByUsuario(usuario).isPresent();
    }
}
