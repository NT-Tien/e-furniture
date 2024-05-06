export class ApiResponse<T> {
    constructor(
        public data: T,
        public message: string = 'Success',
        public statusCode: number = 200
    ) { }
}