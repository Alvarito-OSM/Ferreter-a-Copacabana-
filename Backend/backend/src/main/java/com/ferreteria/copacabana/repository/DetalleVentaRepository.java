package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.dto.DetalleVentaResponseDTO;
import com.ferreteria.copacabana.model.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Integer> {

    List<DetalleVenta> findByIdVenta(Integer idVenta);

    List<DetalleVenta> findByIdProducto(Integer idProducto);

    void deleteByIdVenta(Integer idVenta);

    @Query("SELECT new com.ferreteria.copacabana.dto.DetalleVentaResponseDTO(" +
           "d.idDetalleVenta, d.idVenta, d.idProducto, p.nombre, d.cantidad, d.precioUnitario, d.subtotal) " +
           "FROM DetalleVenta d " +
           "JOIN Producto p ON d.idProducto = p.idProducto " +
           "WHERE d.idVenta = :idVenta")
    List<DetalleVentaResponseDTO> findDetallesConNombreProducto(@Param("idVenta") Integer idVenta);
}
