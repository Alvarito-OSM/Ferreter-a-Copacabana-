
package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoInventarioRepository
        extends JpaRepository<MovimientoInventario, Integer> {

    List<MovimientoInventario> findTop100ByOrderByFechaDesc();

    List<MovimientoInventario>
    findTop100ByProductoIdProductoOrderByFechaDesc(Integer idProducto);
}
