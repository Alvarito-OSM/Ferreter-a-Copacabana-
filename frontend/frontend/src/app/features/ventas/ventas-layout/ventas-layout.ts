import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ventas-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ventas-layout.html',
  styleUrls: ['./ventas-layout.css']
})
export class VentasLayoutComponent {
  // No necesitamos lógica aquí, solo el HTML con las pestañas
}
