import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { SkillComponent } from './components/skills/skills.component';
import { EducationComponent } from './components/education/education.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { E2oInternComponent } from './e2ointern/e2o-intern.component';
import { PencilwalkInterComponent } from './pencilwalkinter/pencilwalk-inter.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'skills', component: SkillComponent },
  { path: 'edu', component: EducationComponent },
  { path: 'pro', component: ProjectsComponent },
  { path:'pencil',component:PencilwalkInterComponent},
  {path:'e2o',component:E2oInternComponent},
];
