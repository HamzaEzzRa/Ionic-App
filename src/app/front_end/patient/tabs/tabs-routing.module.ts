import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'homepage',
        loadChildren: () => import('../homepage/homepage.module').then( m => m.HomepagePageModule),
      },
      {
        path: 'docspace',
        loadChildren: () => import('../docspace/docspace.module').then( m => m.DocspacePageModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then( m => m.ProfilePageModule),
      }
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/homepage',
    pathMatch: 'full'
  },
  {
    path: 'popovercomponent',
    loadChildren: () => import('./popovercomponent/popovercomponent.module').then( m => m.PopovercomponentPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
