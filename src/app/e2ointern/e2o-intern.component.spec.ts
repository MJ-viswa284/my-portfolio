import { ComponentFixture, TestBed } from '@angular/core/testing';

import { E2oInternComponent } from './e2o-intern.component';

describe('E2oInternComponent', () => {
  let component: E2oInternComponent;
  let fixture: ComponentFixture<E2oInternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [E2oInternComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(E2oInternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
