package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface productoRepository extends JpaRepository<producto, Integer> {

    List<producto> findByCategoriaIdCategoria(Integer idCategoria);

    List<producto> findByNombreContainingIgnoreCase(String nombre);
}