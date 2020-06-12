import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocspacePage } from './docspace.page';

const routes: Routes = [
  {
    path: '',
    component: DocspacePage
  },
  {
    path: ':dcLastName/:dcFirstName',
    loadChildren: () => import('./ordonnance/ordonnance.module').then( m => m.OrdonnancePageModule)
  },
  {
    path: 'details',
    loadChildren: () => import('./details/details.module').then( m => m.DetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocspacePageRoutingModule {}
