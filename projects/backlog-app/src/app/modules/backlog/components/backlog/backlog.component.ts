import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { IssueVM } from 'projects/backlog-app/src/app/core/models/issue';
import { AlertService } from 'projects/shared/src/lib/services/alert.service';
import { getMomentDate, LoggerService } from 'projects/shared/src/public-api';
import { Observable } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { BacklogService } from '../../services/backlog.service';


@Component( {
	selector: 'app-backlog',
	templateUrl: './backlog.component.html',
	styleUrls: [ './backlog.component.css' ],
	encapsulation: ViewEncapsulation.None,
} )
export class BacklogComponent implements OnInit, OnDestroy {



	// FACT: 1 day = X px
	// 8 * 60 * 60 seconds = X px
	// 8 * 60 * 60 / X seconds = 1 px
	private readonly secondsPerPxRatio = ( 8 * 60 * 60 ) / 200;
	private readonly CELL_HEIGHT = 150;
	// private readonly dateFormat = 'YYYY-MM-DD hh:mm:ss';
	private readonly dateFormat = 'YYYY-MM-DD';
	private readonly minWidth: number = 170;
	private readonly maxWidth: number = 600;
	private readonly longPerPx = 600;
	private readonly longPerSeconds = () => this.longPerPx * this.secondsPerPxRatio;

	public allLabels: string[] = [];
	public labelsIssues: IssueVM[][] = [];
	public issuesVM$: Observable<IssueVM[]>;

	private _width?: number;

	@ViewChild( 'issuesContainerRef' ) issuesContainerRef: ElementRef = new ElementRef( {} );

	get widthString () {
		return `${ this._width || 0 }px`;
	}

	constructor ( public logger: LoggerService, public alert: AlertService, public backlogService: BacklogService ) {
		this.logger.info( this.constructor.name );
		this.issuesVM$ = this.init();
	}

	ngOnInit (): void {
	}

	ngOnDestroy (): void { }

	private setWidth = ( value?: number ): void => {
		if ( this.issuesContainerRef ) this._width = value || ( this.issuesContainerRef?.nativeElement as HTMLDivElement ).offsetWidth || 0;
	}

	private init = () => {
		return this.backlogService.data$.pipe(
			map( d => {
				let res = d.map( i => ( {
					...i,
					code: i.key,
					title: i.fields.summary,
					dueDate: i.fields.duedate || '',
					startDate: this.getStartDate( i.fields.duedate as string, i?.fields?.timetracking?.originalEstimateSeconds || 0, this.dateFormat ),
					labels: i.fields.labels || [],
					time: i.fields.timetracking.originalEstimateSeconds || 0,
				} as IssueVM ) );
				res = this.calculateItemsWidth( this.calculateTimesMilliseconds( res ) );
				return res.sort( ( a, b ) => a.dueDateMilliseconds - b.dueDateMilliseconds );
			} ),
			tap( d => {
				this.allLabels = this.extractLabels( d ) || [];
				this.labelsIssues = this.extractLabelsIssues( this.allLabels, d );
			} ),
			delay( 1000 ),
			tap( () => {
				this.setWidth();
			} )
		);
	}

	@HostListener( 'window:resize', [ '$event' ] )
	private onResizeWindow = ( event: any ) => {
		this.setWidth( event.target.innerWidth );
	}


	private calculateTimesMilliseconds = ( issues: IssueVM[] ): IssueVM[] => {
		return issues.map( i => ( {
			...i,
			dueDateMilliseconds: getMomentDate( i.dueDate, this.dateFormat ).valueOf(),
			startDateMilliseconds: getMomentDate( i.startDate, this.dateFormat ).valueOf(),
		} as IssueVM ) );
	}


	private calculateItemsWidth = ( issues: IssueVM[] ) => {
		return issues.sort( ( a, b ) => a.dueDate <= b.dueDate ? -1 : 1 )
			.map( w => ( {
				...w,
				width: this.calculateWidth( w, this.secondsPerPxRatio, this.minWidth, this.maxWidth ),
			} ) );
	}

	private extractLabels = ( d: IssueVM[] ) => {
		const tempSet = new Set<string>();
		( d || [] ).forEach( i => {
			( i.labels || [] ).forEach( l => tempSet.add( String( l ) ) );
		} );
		return [ ...tempSet ].sort( ( a, b ) => a <= b ? -1 : 1 );
	}

	private extractLabelsIssues = ( labels: string[], source: IssueVM[] ): IssueVM[][] => {
		if ( !labels || labels.length === 0 ) return [];
		return labels.reduce( ( result: IssueVM[][], nextLabel: string, index: number ) => {
			if ( !result ) result = [];
			result[ index ] = ( source
				.filter( issue => ( issue?.labels || [] ).includes( nextLabel ) ) || []
			)
				.sort( ( a, b ) => ( a?.startDateMilliseconds || 0 ) - ( b?.dueDateMilliseconds || 0 ) );
			return result;
		}, [] );
	}

	private getStartDate = ( dueDate: string, timeBySeconds: number, format: string = 'YYYY-MM-DD' ): string => {
		if ( !dueDate || !timeBySeconds ) return '';
		const dueDateMoment = getMomentDate( dueDate, format );
		if ( !dueDateMoment.isValid() ) return '';
		const startDateMoment = dueDateMoment.clone().subtract( timeBySeconds, 'seconds' );
		return startDateMoment.format( format );
	}

	private calculateWidth = ( issue: IssueVM, secondsPerPxRatio: number = 288, min: number = 150, max: number = 600 ): number => {
		const { time } = issue;
		if ( !time ) return 0;
		let result = time / ( secondsPerPxRatio || 1 );
		if ( result < min ) result = min;
		if ( result > max ) result = max;
		return result;
	}


	public onFetchRemoteToggleChange = () => {
		const newValue = !this.backlogService.isToFetchFromJira$.getValue();
		this.logger.info( 'onFetchRemoteToggleChange newValue: ' + newValue );
		this.backlogService.isToFetchFromJira$.next( newValue );
	}
}


