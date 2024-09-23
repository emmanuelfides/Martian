/*
Project : Cryptotrades
FileName :  app-routing.module.ts
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the main routing file which load all routes in the application
*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MarketplaceComponent } from './components/marketplace/marketplace.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { StatsComponent } from './components/stats/stats.component';
import { UserGuard } from './guard/user.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'marketplace',
    component: MarketplaceComponent,
  },
  {
    path: 'stats',
    component: StatsComponent,
  },
  { path: 'profile/:id',
  component:ProfileComponent,
  loadChildren: () => import('./components/profile/profile.module').then(m => m.ProfileModule),},
  { path: 'settings',
  component:SettingsComponent,
  canActivate:[UserGuard],
  loadChildren: () => import('./components/settings/settings.module').then(m => m.SettingsModule),},
  { path: 'collection', loadChildren: () => import('./components/collections/collections.module').then(m => m.CollectionsModule),},
  { path: 'item', loadChildren: () => import('./components/items/items.module').then(m => m.ItemsModule),},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
