package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface proveedorRepository extends JpaRepository<proveedor, Integer> {
}