import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'projects/shared/src/public-api';
import { ROUTES_MAP } from '../../core/configurations/routes-map';
import { BacklogComponent } from './components/backlog/backlog.component';
import { IssueCardComponent } from './components/issue-card/issue-card.component';


const routes: Routes = [
	{ path: ROUTES_MAP.empty, component: BacklogComponent },
];

@NgModule( {
	declarations: [
		BacklogComponent,
		IssueCardComponent,
	],
	imports: [
		CommonModule,
		RouterModule.forChild( routes ),
		HttpClientModule,
		SharedModule,
	]
} )
export class BacklogModule { }
