package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Integer> {

    Optional<Inventario> findByProductoIdProducto(Integer idProducto);

    List<Inventario> findByStockActualLessThanEqual(Integer stock);
}