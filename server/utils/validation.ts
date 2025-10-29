import { type Request, type Response, type NextFunction } from 'express';
import { type ZodObject, ZodError, type ZodIssue } from 'zod';

export const validate = (schema: ZodObject<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
            file: req.file,
        });
        return next();
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const zodError = error as ZodError;
            const errorMessages = zodError.issues.map((e: ZodIssue) => ({
                path: e.path.join('.'),
                message: e.message,
            }));
            return res.status(400).json({ errors: errorMessages });
        }
        // For other types of errors, you might want to pass them to the next error handler
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};