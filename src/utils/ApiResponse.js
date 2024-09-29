class ApiResponse {
    constructor(successCode, data, message) {
        this.successCode = successCode;
        this.data = data;
        this.message = message;
        this.success = successCode < 400;
    }
}

export {ApiResponse};