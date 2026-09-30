package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface inventarioRepository extends JpaRepository<inventario, Integer> {

    Optional<inventario> findByProductoIdProducto(Integer idProducto);

    List<inventario> findByStockActualLessThanEqual(Integer stock);
}