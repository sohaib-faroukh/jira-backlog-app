
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Issue } from '../models/issue';

@Injectable()
export class ResponseDataInterceptor implements HttpInterceptor {
	intercept ( req: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {
		return next.handle( req ).pipe( map( event => {
			if ( event instanceof HttpResponse && event.body ) {
				if ( 'issues' in event.body ) {
					return event.clone<any>( { body: event.body.issues as Issue[] } );
				}
			}
			return event;
		} ) );
	}
}
