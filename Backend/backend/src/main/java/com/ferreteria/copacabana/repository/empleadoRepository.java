package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface empleadoRepository extends JpaRepository<empleado, Integer> {
}