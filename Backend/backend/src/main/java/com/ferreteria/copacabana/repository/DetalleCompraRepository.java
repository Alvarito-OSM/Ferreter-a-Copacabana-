package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.DetalleCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleCompraRepository extends JpaRepository<DetalleCompra, Integer> {

    @Query("""
            select p.idProducto, p.nombre, p.codigoBarras, d.cantidad, d.precioUnitario, c.fecha
            from DetalleCompra d, Compra c, Producto p
            where d.idCompra = c.idCompra
              and d.idProducto = p.idProducto
              and c.idProveedor = :idProveedor
              and c.estado <> 'ANULADA'
            order by c.fecha desc
            """)
    List<Object[]> findSuministrosPorProveedor(@Param("idProveedor") Integer idProveedor);
}
