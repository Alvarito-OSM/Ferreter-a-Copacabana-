package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {

    List<Venta> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Venta> findByIdCliente(Integer idCliente);

    List<Venta> findByIdEmpleado(Integer idEmpleado);

    List<Venta> findByEstado(String estado);

    // 👇 NUEVO MÉTODO PARA EL DASHBOARD 👇
    @Query("SELECT SUM(v.total) FROM Venta v WHERE v.estado = 'COMPLETADA' AND v.fecha BETWEEN :inicio AND :fin")
    BigDecimal sumarVentasEntreFechas(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}
