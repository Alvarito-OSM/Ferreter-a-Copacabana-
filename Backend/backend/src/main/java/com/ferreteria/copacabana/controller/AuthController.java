package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.dto.LoginRequest;
import com.ferreteria.copacabana.dto.LoginResponse;
import com.ferreteria.copacabana.dto.RegistroClienteRequest;
import com.ferreteria.copacabana.model.Administrador;
import com.ferreteria.copacabana.model.Cliente;
import com.ferreteria.copacabana.model.Empleado;
import com.ferreteria.copacabana.repository.AdministradorRepository;
import com.ferreteria.copacabana.repository.EmpleadoRepository;
import com.ferreteria.copacabana.repository.ClienteRepository;
import com.ferreteria.copacabana.service.CustomUserDetailsService;
import com.ferreteria.copacabana.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private AdministradorRepository administradorRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    private Integer resolverId(String usuario, String rol) {
        if ("ROLE_ADMINISTRADOR".equals(rol)) {
            return administradorRepository.findByUsuario(usuario).map(Administrador::getIdAdministrador).orElse(null);
        }
        if ("ROLE_EMPLEADO".equals(rol)) {
            return empleadoRepository.findByUsuario(usuario).map(Empleado::getIdEmpleado).orElse(null);
        }
        return clienteRepository.findByUsuario(usuario).map(Cliente::getIdCliente).orElse(null);
    }

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1. Autenticar al usuario
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsuario(),
                            request.getContrasena()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            String rol = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_EMPLEADO");

            Integer idUsuario = resolverId(userDetails.getUsername(), rol);

            String token = jwtService.generarToken(
                    userDetails.getUsername(),
                    rol,
                    idUsuario
            );

            LoginResponse response = new LoginResponse(
                    token,
                    userDetails.getUsername(),
                    rol,
                    idUsuario
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Credenciales inválidas");
            error.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody RegistroClienteRequest request) {
        String mensaje = validarRegistro(request);
        if (mensaje != null) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", mensaje));
        }

        Cliente cliente = new Cliente();
        cliente.setNombre(request.getNombre().trim());
        cliente.setApellido(request.getApellido());
        cliente.setCedulaNit(request.getCedulaNit().trim());
        cliente.setTelefono(request.getTelefono());
        cliente.setEmail(request.getEmail());
        cliente.setDireccion(request.getDireccion());
        cliente.setUsuario(request.getUsuario().trim());
        cliente.setContrasena(passwordEncoder.encode(request.getContrasena()));

        clienteRepository.save(cliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Cuenta creada correctamente"));
    }

    private String validarRegistro(RegistroClienteRequest request) {
        if (esVacio(request.getNombre()) || esVacio(request.getCedulaNit())) {
            return "El nombre y la cédula/NIT son obligatorios.";
        }
        if (esVacio(request.getUsuario()) || request.getUsuario().trim().length() < 4) {
            return "El usuario debe tener al menos 4 caracteres.";
        }
        if (esVacio(request.getContrasena()) || request.getContrasena().length() < 6) {
            return "La contraseña debe tener al menos 6 caracteres.";
        }
        if (clienteRepository.existsByCedulaNit(request.getCedulaNit().trim())) {
            return "Ya existe un cliente con esa cédula/NIT.";
        }
        if (clienteRepository.existsByUsuario(request.getUsuario().trim())
                || userDetailsService.existeUsuario(request.getUsuario().trim())) {
            return "Ese nombre de usuario ya está en uso.";
        }
        return null;
    }

    private boolean esVacio(String valor) {
        return valor == null || valor.isBlank();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("usuario", authentication.getName());
        response.put("autoridades", authentication.getAuthorities());
        return ResponseEntity.ok(response);
    }
}