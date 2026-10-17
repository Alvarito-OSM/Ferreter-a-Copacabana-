package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
// Buscar categorías por nombre
    List<Categoria> findByNombreContainingIgnoreCase(String nombre);

    // Verificar si existe una categoría con ese nombre
    boolean existsByNombreIgnoreCase(String nombre);

    // Verificar duplicados al editar, excluyendo la misma categoría
    boolean existsByNombreIgnoreCaseAndIdCategoriaNot(
            String nombre,
            Integer idCategoria
    );
}