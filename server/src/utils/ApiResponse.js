class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.status = 'success';
    this.message = message;
    this.data = data;
  }

  // Static factory methods
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  static created(res, data, message = 'Created successfully') {
    return res.status(201).json({
      status: 'success',
      message,
      data,
    });
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static paginated(res, { data, pagination }, message = 'Success') {
    return res.status(200).json({
      status: 'success',
      message,
      data,
      pagination,
    });
  }

  static file(res, filePath, fileName) {
    return res.download(filePath, fileName);
  }
}

export default ApiResponse;