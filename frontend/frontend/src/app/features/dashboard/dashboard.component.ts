import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html', 
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(private authService: AuthService) {}

  get usuario(): string {
    return this.authService.getUsuario() || 'Usuario';
  }

  get rol(): string {
    return (this.authService.getRol() || '').replace('ROLE_', '');
  }
}
