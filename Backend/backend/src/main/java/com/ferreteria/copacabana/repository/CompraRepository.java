package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {

    List<Compra> findByIdProveedorOrderByFechaDesc(Integer idProveedor);
}
