package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.DetalleCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleCompraRepository extends JpaRepository<DetalleCompra, Integer> {
}
