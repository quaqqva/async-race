export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export enum ResponseStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  TooManyRequests = 429,
  InternalServerError = 500,
}
