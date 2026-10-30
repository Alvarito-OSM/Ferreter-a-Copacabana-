
package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.MovimientoCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoCajaRepository
        extends JpaRepository<MovimientoCaja, Integer> {

    List<MovimientoCaja> findByIdTurnoOrderByFechaDesc(
            Integer idTurno);
}
