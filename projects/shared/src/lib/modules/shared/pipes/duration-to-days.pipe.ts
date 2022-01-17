import { Pipe, PipeTransform } from '@angular/core';
import { duration } from 'moment';

@Pipe( {
	name: 'durationToDays', pure: true,
} )

export class DurationToDaysPipe implements PipeTransform {

	transform ( milliseconds: number | string ): string {
		const n = Number( milliseconds );
		if ( isNaN( n ) ) return '';
		return `${ duration( n ).asDays().toFixed( 1 ) } Day(s)`;
	}

}
