
package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Inventario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Integer> {

    Optional<Inventario> findByProductoIdProducto(Integer idProducto);

    List<Inventario> findByStockActualLessThanEqual(Integer stock);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventario i WHERE i.producto.idProducto = :idProducto")
    Optional<Inventario> buscarPorProductoBloqueado(
            @Param("idProducto") Integer idProducto);

    @Query("SELECT i FROM Inventario i WHERE i.stockActual <= i.stockMinimo")
    List<Inventario> buscarStockBajo();
}
