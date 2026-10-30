
package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.LoteProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoteProductoRepository
        extends JpaRepository<LoteProducto, Integer> {

    List<LoteProducto>
    findByFechaVencimientoIsNotNullAndFechaVencimientoBetweenOrderByFechaVencimientoAsc(
            LocalDate desde, LocalDate hasta);

    List<LoteProducto>
    findByFechaVencimientoIsNotNullAndFechaVencimientoBeforeOrderByFechaVencimientoAsc(
            LocalDate fecha);
}
