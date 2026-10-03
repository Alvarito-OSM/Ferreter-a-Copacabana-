package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {

    List<Venta> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Venta> findByIdCliente(Integer idCliente);

    List<Venta> findByIdEmpleado(Integer idEmpleado);

    List<Venta> findByEstado(String estado);
}