package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Cliente;
import com.ferreteria.copacabana.service.ClienteService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    // Listar clientes y buscar por nombre, apellido o documento.
    @GetMapping
    public List<Cliente> listar(
            @RequestParam(name = "q", defaultValue = "") String busqueda
    ) {
        return clienteService.buscar(busqueda);
    }

    // Consultar un cliente por su identificador.
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscar(
            @PathVariable("id") Integer id
    ) {
        return clienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Registrar un cliente nuevo.
    @PostMapping
    public ResponseEntity<Cliente> crear(
            @RequestBody Cliente cliente
    ) {
        // El identificador lo genera PostgreSQL.
        cliente.setIdCliente(null);

        Cliente guardado = clienteService.guardar(cliente);

        return ResponseEntity
                .created(URI.create(
                        "/api/clientes/" + guardado.getIdCliente()
                ))
                .body(guardado);
    }

    // Actualizar el cliente indicado en la URL.
    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizar(
            @PathVariable("id") Integer id,
            @RequestBody Cliente cliente
    ) {
        cliente.setIdCliente(id);

        Cliente actualizado = clienteService.guardar(cliente);

        return ResponseEntity.ok(actualizado);
    }

    // Desactivar sin borrar las ventas relacionadas.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable("id") Integer id
    ) {
        clienteService.eliminar(id);

        return ResponseEntity.noContent().build();
    }

    // Devolver los errores de validación de este módulo.
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> manejarValidacion(
            ResponseStatusException excepcion
    ) {
        String mensaje = excepcion.getReason();

        if (mensaje == null) {
            mensaje = "No se pudo completar la operación.";
        }

        return ResponseEntity
                .status(excepcion.getStatusCode())
                .body(Map.of("mensaje", mensaje));
    }

    // Proteger también ante duplicados detectados por PostgreSQL.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> manejarIntegridad(
            DataIntegrityViolationException excepcion
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "mensaje",
                        "No se pudo guardar. Revisa si la cédula/NIT "
                                + "ya está registrada."
                ));
    }
}