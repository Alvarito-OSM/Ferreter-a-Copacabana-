package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Integer> {

    List<Pago> findByIdVenta(Integer idVenta);
}