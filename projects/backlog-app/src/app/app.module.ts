import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from 'projects/shared/src/public-api';
import { ROUTES_MAP } from './core/configurations/routes-map';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from './core/core.module';

const routes: Routes = [
	{
		path: ROUTES_MAP.empty, component: AppComponent, children: [
			{ path: ROUTES_MAP.empty, loadChildren: () => import( './layouts/client-layout/client-layout.module' ).then( m => m.ClientLayoutModule ) },
		],
	},
];
@NgModule( {
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		CoreModule,
		RouterModule.forRoot( routes ),
		SharedModule,
	],
	providers: [],
	bootstrap: [ AppComponent ]
} )
export class AppModule { }
