import { Request, Response, NextFunction } from 'express'

/**
 * Wrapper for async express handlers to handle exceptions.
 * Passes any error to the next() function to be caught by the global error handler.
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}
