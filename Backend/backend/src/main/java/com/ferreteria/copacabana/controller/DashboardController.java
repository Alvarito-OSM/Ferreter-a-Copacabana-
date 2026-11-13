package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.repository.ClienteRepository;
import com.ferreteria.copacabana.repository.InventarioRepository;
import com.ferreteria.copacabana.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired private VentaRepository ventaRepository;
    @Autowired private InventarioRepository inventarioRepository;
    @Autowired private ClienteRepository clienteRepository;

    @GetMapping("/metricas")
    public ResponseEntity<Map<String, Object>> obtenerMetricas() {
        Map<String, Object> response = new HashMap<>();

        // 1. Ventas de hoy (00:00 a 23:59)
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().atTime(23, 59, 59);
        BigDecimal ventasHoy = ventaRepository.sumarVentasEntreFechas(inicioHoy, finHoy);
        response.put("ventasHoy", ventasHoy != null ? ventasHoy : BigDecimal.ZERO);

        // 2. Ganancias del Mes (Día 1 del mes hasta hoy)
        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        BigDecimal gananciasMes = ventaRepository.sumarVentasEntreFechas(inicioMes, finHoy);
        response.put("gananciasMes", gananciasMes != null ? gananciasMes : BigDecimal.ZERO);

        // 3. Alertas de Stock Bajo (Usando tu método existente buscarStockBajo)
        int stockBajo = inventarioRepository.buscarStockBajo().size();
        response.put("productosBajoStock", stockBajo);

        // 4. Clientes Totales
        long totalClientes = clienteRepository.count();
        response.put("clientesTotales", totalClientes);

        return ResponseEntity.ok(response);
    }
}
