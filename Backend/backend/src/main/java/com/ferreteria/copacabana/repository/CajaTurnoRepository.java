
package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.CajaTurno;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CajaTurnoRepository
        extends JpaRepository<CajaTurno, Integer> {

    Optional<CajaTurno>
    findFirstByIdEmpleadoAndEstadoOrderByFechaAperturaDesc(
            Integer idEmpleado, String estado);

    List<CajaTurno> findAllByOrderByFechaAperturaDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CajaTurno c WHERE c.idTurno = :id")
    Optional<CajaTurno> buscarBloqueado(@Param("id") Integer id);
}
