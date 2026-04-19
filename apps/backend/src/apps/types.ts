type appResponse<T> = {
	success: boolean;
	message: string;
	error: string;
	data: T;
};
