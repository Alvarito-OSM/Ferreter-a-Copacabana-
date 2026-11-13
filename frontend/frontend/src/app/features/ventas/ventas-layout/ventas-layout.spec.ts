import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentasLayout } from './ventas-layout';

describe('VentasLayout', () => {
  let component: VentasLayout;
  let fixture: ComponentFixture<VentasLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(VentasLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
