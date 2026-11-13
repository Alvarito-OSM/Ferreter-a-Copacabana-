import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogoPublico } from './catalogo-publico';

describe('CatalogoPublico', () => {
  let component: CatalogoPublico;
  let fixture: ComponentFixture<CatalogoPublico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoPublico],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoPublico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
