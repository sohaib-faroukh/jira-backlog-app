import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService, BaseCrudService, errorCatcher, HttpSearchOptions, LoggerService } from 'projects/shared/src/public-api';
import { BehaviorSubject, catchError, debounceTime, delay, distinctUntilChanged, expand, filter, map, Observable, of, retry, switchMap, take, tap } from 'rxjs';
import { Issue } from '../../../core/models/issue';


interface IAccessTokenResponse {
	access_token: string;
	expires_in: number | string;
	scope: string;
}

@Injectable( {
	providedIn: 'root'
} )
export class BacklogService extends BaseCrudService<Issue, HttpSearchOptions>{

	private readonly JIRA_DOMAIN = 'https://pinguintest.atlassian.net';
	private readonly JIRA_USERNAME = 'ILikePengus.R@gmail.com';
	private readonly JIRA_API_TOKEN = 'hLIQvhojJBRbQZQfzEr487FE';
	// private readonly JIRA_API_PASSWORD = 'LetsGetItDone';
	private readonly CLIENT_ID = 'CKEyRKLYLvnhZh7AIqzjFskUM8QY18nj';
	private readonly CLIENT_SECRET = 'Oxec0KYMddIPEXDMdR1RxUJ7T6ULSHVYtQ1hqvwLIGhZlB96auL44FvWeCFQk_1H';

	private accessToken?: IAccessTokenResponse;
	public isToFetchFromJira$ = new BehaviorSubject<boolean>( false );
	public isFetchingFromJira$ = new BehaviorSubject<boolean>( false );


	constructor (
		override http: HttpClient,
		public logger: LoggerService,
		private route: ActivatedRoute,
		private alert: AlertService,
	) {
		super( http );
		this.apiUrl = `assets/data.json`;
		this.init();
		this.onCodeReceived().subscribe();

	}

	private init = () => {

		this.isToFetchFromJira$
			.pipe(
				tap( () => this.isFetchingFromJira$.next( true ) ),
				distinctUntilChanged(),
				debounceTime( 1000 ),
			)
			.subscribe(
				async ( value ) => {
					try {
						this.logger.info( 'isToFetchFromJira$.pipe **********' );
						if ( !value ) {
							await this.fetch().toPromise();
						}
						else if ( value === true && ( !this.accessToken || !!this.accessToken?.access_token ) ) {
							await this.oAuthJira().toPromise();
						}
					} catch ( error: any ) {
						this.alert.danger( error.error.message || 'something went wrong, see the logs...' );
						this.logger.error( error );
					}
					finally {
						this.isFetchingFromJira$.next( false );
					}
				},
				( error ) => {
					this.isFetchingFromJira$.next( false )
					this.alert.danger( error.error.message || 'something went wrong, see the logs...' );
					this.logger.error( error );
				}
			);

	}


	private getOAuthJira = ( redirectUrl: string, stateData?: string ): string => {
		let url = `https://auth.atlassian.com/authorize?`
			+ `audience=api.atlassian.com&client_id=${ this.CLIENT_ID }`
			+ `&redirect_uri=${ redirectUrl }`
			+ `&scope=read%3Ajira-user%20read%3Ajira-work`
			+ `${ stateData ? 'state=' + stateData : '' }`
			+ `&response_type=code`
			+ `&prompt=consent`;
		return `${ url }`;
	}

	private oAuthJira = ( redirectUrl?: string, stateData?: string ) => {
		this.logger.info( 'start oAuthJira' );
		redirectUrl ||= window.location.origin;
		this.logger.info( redirectUrl );
		const url = this.getOAuthJira( redirectUrl, stateData );

		const headers = new HttpHeaders( {
			'Access-Control-Allow-Origin': '*',
			// 'Access-Control-Allow-Origin': 'http://localhost:4200',
			// 'withCredentials': 'true',
			// 'X-Atlassian-Token': 'no-check',
			// 'Accept': '*/*',
			// 'Cache-Control': 'no-cache',
		} );

		return this.http.get<any>( url, { headers } ).pipe(
			switchMap( ( value: any ) => {
				return this.exchange( {
					client_id: this.CLIENT_ID,
					redirect_uri: redirectUrl || '',
					client_secret: String( this.CLIENT_SECRET ) || '',
					grant_type: 'authorization_code',
					code: String( value?.code ) || '',
				} ).pipe(
					take( 1 ),
					retry( 3 ),
					switchMap( ( d: IAccessTokenResponse ) => new Promise( () => this.accessToken = d ) ),
					catchError( errorCatcher ),
				)
			} )
		);
	}


	private onCodeReceived = ( redirectUri?: string ) => {
		redirectUri ||= window.location.origin;

		return this.route.queryParams.pipe(
			filter( ( params: any ) => !!params?.code ),
			map( ( params: any ) => params.code ),
			switchMap( ( accessCode: any ) => {
				this.logger.info( 'onCodeReceived - accessCode ' + accessCode );
				return this.exchange( {
					code: String( accessCode ),
					redirect_uri: redirectUri || '',
					client_id: this.CLIENT_ID,
					client_secret: this.CLIENT_SECRET,
					grant_type: 'authorization_code',
				} ).pipe(
					tap( d => this.accessToken = d ),
					switchMap( d => {
						this.logger.info( '---------------access_token: ' );
						this.logger.info( d );
						return this.fetchFromJira( d.access_token );
					}
					)
				)
			} ),
		)
	}

	private exchange = ( data: {
		grant_type: string,
		client_id: string,
		client_secret: string,
		code: string,
		redirect_uri: string,
	} ) => {

		this.logger.info( 'start exchange' );
		const url = `https://auth.atlassian.com/oauth/token`;
		return this.http.post<IAccessTokenResponse>( url, data );

	}



	private fetchFromJira = ( accessToken: string ): Observable<any> => {
		const encodedAuthHeaderValue = btoa( `${ this.JIRA_USERNAME }:${ this.JIRA_API_TOKEN }` );

		const headers = new HttpHeaders( {
			'Authorization': `Bearer ${ accessToken }`,
			'Content-Type': 'application/json'
		} )

		const url = `${ this.JIRA_DOMAIN }/rest/api/2/issue`;
		return this.http.get( url, { headers } );
	};
}
