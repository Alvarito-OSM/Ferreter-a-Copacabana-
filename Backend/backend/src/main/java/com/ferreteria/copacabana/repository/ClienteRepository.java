package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository
        extends JpaRepository<Cliente, Integer> {

    // Clientes ordenados alfabéticamente.
    List<Cliente> findAllByOrderByNombreAscApellidoAsc();

    // Comprueba documentos duplicados al registrar.
    boolean existsByCedulaNit(String cedulaNit);

    // Comprueba documentos duplicados al editar,
    // excluyendo al cliente que estamos modificando.
    boolean existsByCedulaNitAndIdClienteNot(
            String cedulaNit,
            Integer idCliente
    );

    // Busca por nombre, apellido o cédula/NIT.
    List<Cliente>
    findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCaseOrCedulaNitContainingIgnoreCaseOrderByNombreAsc(
            String nombre,
            String apellido,
            String cedulaNit
    );
}