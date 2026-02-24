import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CuadrantePage } from './cuadrante.page';

describe('CuadrantePage', () => {
  let component: CuadrantePage;
  let fixture: ComponentFixture<CuadrantePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CuadrantePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
