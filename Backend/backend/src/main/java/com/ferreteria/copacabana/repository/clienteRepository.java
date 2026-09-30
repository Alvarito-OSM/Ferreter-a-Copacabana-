package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface clienteRepository extends JpaRepository<cliente, Integer> {
}