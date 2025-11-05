import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PencilwalkInterComponent } from './pencilwalk-inter.component';

describe('PencilwalkInterComponent', () => {
  let component: PencilwalkInterComponent;
  let fixture: ComponentFixture<PencilwalkInterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PencilwalkInterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PencilwalkInterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
