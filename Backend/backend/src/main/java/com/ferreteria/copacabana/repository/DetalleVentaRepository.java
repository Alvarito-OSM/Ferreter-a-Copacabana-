package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Integer> {

    List<DetalleVenta> findByIdVenta(Integer idVenta);

    List<DetalleVenta> findByIdProducto(Integer idProducto);

    void deleteByIdVenta(Integer idVenta);
}