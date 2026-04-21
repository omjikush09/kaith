class CustomError extends Error {
	code: number;
	constructor(message: string, code: number) {
		super(message);
		this.code = code;
	}
}

class BadRequestError extends CustomError {
	constructor(message = "Bad Request", code = 400) {
		super(message, code);
	}
}

class InternalServerError extends CustomError {
	constructor(message = "Internal Server Error", code = 500) {
		super(message, code);
	}
}

export { CustomError, BadRequestError, InternalServerError };
