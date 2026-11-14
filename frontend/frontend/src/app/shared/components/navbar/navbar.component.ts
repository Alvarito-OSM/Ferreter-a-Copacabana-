import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin, interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  modoOscuro: boolean = false;
  usuario: string = '';
  rol: string = '';
  
  notificaciones: any[] = [];
  mostrarNotificaciones: boolean = false;
  
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';
  
  // Variable para el temporizador de actualización automática
  private actualizacionSub?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario() || 'Usuario';
    const rolActual = this.authService.getRol();
    this.rol = rolActual === 'ROLE_ADMINISTRADOR' ? 'ADMINISTRADOR' : 'EMPLEADO';

    this.checkTemaGuardado();
    
    // 1. Cargar notificaciones al iniciar
    this.cargarNotificaciones();

    // 2. Auto-actualizar cada 30 segundos (30000 ms)
    this.actualizacionSub = interval(30000).subscribe(() => {
      this.cargarNotificaciones();
    });
  }

  ngOnDestroy(): void {
    // Limpiar el temporizador cuando se cierre el componente
    if (this.actualizacionSub) {
      this.actualizacionSub.unsubscribe();
    }
  }

  cambiarTema(): void {
    this.modoOscuro = !this.modoOscuro;
    if (this.modoOscuro) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('tema', 'oscuro');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('tema', 'claro');
    }
  }

  checkTemaGuardado(): void {
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'oscuro') {
      this.modoOscuro = true;
      document.body.classList.add('dark-mode');
    }
  }

  logout(): void {
    this.authService.logout();
  }

  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  @HostListener('document:click', ['$event'])
  clickFuera(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-wrapper')) {
      this.mostrarNotificaciones = false;
    }
  }

  cargarNotificaciones(): void {
    // Pedimos productos e inventario al mismo tiempo para cruzarlos
    forkJoin({
      productos: this.http.get<any[]>(`${this.apiUrl}/productos`),
      inventarios: this.http.get<any[]>(`${this.apiUrl}/inventario`)
    }).subscribe({
      next: (data) => {
        // Filtramos los productos que estén agotados o en bajo stock
        this.notificaciones = data.productos.filter(p => {
          const inv = data.inventarios.find(i => i.producto?.idProducto === p.idProducto);
          const stock = inv ? inv.stockActual : 0;
          const min = inv ? inv.stockMinimo : 5;
          
          // Si el stock es 0 (agotado) o es menor/igual al mínimo (bajo stock)
          return stock === 0 || stock <= min;
        }).map(p => {
          // Agregamos los datos del inventario al producto para mostrarlo en el HTML
          const inv = data.inventarios.find(i => i.producto?.idProducto === p.idProducto);
          return {
            ...p,
            stockActual: inv ? inv.stockActual : 0,
            stockMinimo: inv ? inv.stockMinimo : 5
          };
        });
      },
      error: (err) => console.error('Error al cargar notificaciones', err)
    });
  }
}
