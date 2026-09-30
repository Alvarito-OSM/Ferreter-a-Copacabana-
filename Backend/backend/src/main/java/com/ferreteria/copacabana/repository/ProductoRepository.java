package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    List<Producto> findByCategoriaIdCategoria(Integer idCategoria);

    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}