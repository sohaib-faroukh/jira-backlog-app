import { Component, Input, OnInit } from '@angular/core';
import { IssueVM } from 'projects/backlog-app/src/app/core/models/issue';

@Component( {
	selector: 'app-issue-card',
	templateUrl: './issue-card.component.html',
	styleUrls: [ './issue-card.component.css' ]
} )
export class IssueCardComponent implements OnInit {

	@Input() public data?: IssueVM;
	@Input() public classes?: string[];

	constructor () { }

	ngOnInit (): void {
	}

}
