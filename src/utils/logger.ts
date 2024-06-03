/* eslint-disable no-unused-vars */
export interface Logger {
	log(message: string): void;
	warn(message: string): void;
	debug(message: string): void;
	error(message: string): void;
	trace(message: string): void;
}