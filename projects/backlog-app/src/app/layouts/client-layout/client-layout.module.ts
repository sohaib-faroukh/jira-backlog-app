import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_MAP } from '../../core/configurations/routes-map';
import { ClientLayoutComponent } from './client-layout.component';

const routes: Routes = [
	{
		path: ROUTES_MAP.empty, component: ClientLayoutComponent, children: [
			{ path: ROUTES_MAP.empty, pathMatch: 'full', redirectTo: ROUTES_MAP.backlog },
			{ path: ROUTES_MAP.backlog, loadChildren: () => import( '../../modules/backlog/backlog.module' ).then( m => m.BacklogModule ) },
		],
	},
];

@NgModule( {
	declarations: [ ClientLayoutComponent ],
	imports: [
		CommonModule,
		RouterModule.forChild( routes ),
	],
} )
export class ClientLayoutModule { }
