import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CuadrantesPage } from './cuadrantes.page';

describe('CuadrantesPage', () => {
  let component: CuadrantesPage;
  let fixture: ComponentFixture<CuadrantesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CuadrantesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
