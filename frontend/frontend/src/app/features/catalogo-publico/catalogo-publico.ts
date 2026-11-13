import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-catalogo-publico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './catalogo-publico.html',
  styleUrls: ['./catalogo-publico.css']
})
export class CatalogoPublicoComponent implements OnInit {
  
  productos: any[] = [];
  categorias: any[] = [];
  busqueda: string = '';
  apiUrl = 'http://localhost:8080/api';

  carritoCount: number = 0;
  carritoTotal: number = 0;

  vistaActual: 'categorias' | 'productos' = 'categorias';
  categoriaSeleccionada: number | null = null;
  nombreCategoriaSeleccionada: string = '';
  
  paginaActual: number = 1;
  itemsPorPagina: number = 10;

  menuAbierto: boolean = false;

  constructor(private http: HttpClient, private router: Router, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.http.get<any[]>(`${this.apiUrl}/productos`).subscribe({
      next: (data) => {
        this.productos = data;
        this.cdRef.detectChanges(); 
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  cargarCategorias() {
    this.http.get<any[]>(`${this.apiUrl}/categorias`).subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  // Redirige a la página de login completa
  abrirLogin() {
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  abrirCategoria(cat: any) {
    this.categoriaSeleccionada = cat.idCategoria;
    this.nombreCategoriaSeleccionada = cat.nombre;
    this.vistaActual = 'productos';
    this.paginaActual = 1;
    this.menuAbierto = false;
    this.scrollTo('inicio');
  }

  volverACategorias() {
    this.vistaActual = 'categorias';
    this.categoriaSeleccionada = null;
    this.nombreCategoriaSeleccionada = '';
    this.busqueda = '';
    this.menuAbierto = false;
    this.scrollTo('inicio');
  }

  obtenerProductosDestacados() {
    return this.productos.slice(0, 4);
  }

  contarProductosCategoria(): number {
    if (!this.categoriaSeleccionada) return this.filtrarProductos().length;
    return this.productos.filter(p => p.categoria && p.categoria.idCategoria === this.categoriaSeleccionada).length;
  }

  obtenerProductoMasCaro(): any {
    let filtrados = this.filtrarProductos();
    if (filtrados.length === 0) return null;
    return filtrados.reduce((max, prod) => (Number(prod.precioVenta) > Number(max.precioVenta) ? prod : max), filtrados[0]);
  }

  filtrarProductos() {
    let filtrados = this.productos;
    if (this.categoriaSeleccionada) {
      filtrados = filtrados.filter(p => p.categoria && p.categoria.idCategoria === this.categoriaSeleccionada);
    }
    if (this.busqueda) {
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) || 
        p.codigoBarras.includes(this.busqueda)
      );
    }
    return filtrados;
  }

  obtenerProductosPaginados() {
    const filtrados = this.filtrarProductos();
    const indiceInicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const indiceFin = indiceInicio + this.itemsPorPagina;
    return filtrados.slice(indiceInicio, indiceFin);
  }

  obtenerTotalPaginas() {
    return Math.ceil(this.filtrarProductos().length / this.itemsPorPagina);
  }

  obtenerPaginasArray() {
    const total = this.obtenerTotalPaginas();
    return Array(total).fill(0).map((x, i) => i + 1);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.obtenerTotalPaginas()) {
      this.paginaActual = pagina;
      this.scrollTo('productos-area');
    }
  }

  buscar() {
    if (this.vistaActual === 'categorias') {
      this.categoriaSeleccionada = null;
      this.nombreCategoriaSeleccionada = 'Resultados de búsqueda';
      this.vistaActual = 'productos';
    }
    this.paginaActual = 1;
    this.menuAbierto = false;
  }

  scrollTo(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  obtenerImagenCategoria(nombreCat: string): string {
    const cat = nombreCat.toLowerCase();
    if (cat.includes('herramienta') && cat.includes('eléctrica')) return 'categorias/electricas.jpg';
    if (cat.includes('herramienta')) return 'categorias/herramientas.jpg';
    if (cat.includes('construcción')) return 'categorias/construccion.jpg';
    if (cat.includes('tornillería')) return 'categorias/tornilleria.jpg';
    if (cat.includes('pintura')) return 'categorias/pinturas.jpg';
    if (cat.includes('plomería')) return 'categorias/plomeria.jpg';
    if (cat.includes('electricidad')) return 'categorias/electricidad.jpg';
    if (cat.includes('jardinería')) return 'categorias/jardineria.jpg';
    if (cat.includes('seguridad')) return 'categorias/seguridad.jpg';
    if (cat.includes('adhesivo')) return 'categorias/adhesivos.jpg';
    if (cat.includes('accesorio')) return 'categorias/accesorios.jpg';
    if (cat.includes('hogar')) return 'categorias/hogar.jpg';
    return 'categorias/default.jpg'; 
  }

  obtenerImagen(prod: any): string {
    if (prod.imagenUrl) return prod.imagenUrl;
    const categoria = prod.categoria?.nombre?.toLowerCase() || '';
    if (categoria.includes('herramienta') && categoria.includes('eléctrica')) return 'categorias/electricas.jpg';
    if (categoria.includes('herramienta')) return 'categorias/herramientas.jpg';
    if (categoria.includes('construcción')) return 'categorias/construccion.jpg';
    if (categoria.includes('tornillería')) return 'categorias/tornilleria.jpg';
    if (categoria.includes('pintura')) return 'categorias/pinturas.jpg';
    if (categoria.includes('plomería')) return 'categorias/plomeria.jpg';
    if (categoria.includes('electricidad')) return 'categorias/electricidad.jpg';
    if (categoria.includes('jardinería')) return 'categorias/jardineria.jpg';
    if (categoria.includes('seguridad')) return 'categorias/seguridad.jpg';
    return 'categorias/default.jpg';
  }

  agregarAlCarritoVisual(producto: any) {
    this.carritoCount++;
    const precio = Number(producto.precioVenta) || 0;
    this.carritoTotal += precio;
  }
}
