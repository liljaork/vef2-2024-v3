import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import slugify from 'slugify';
import xss from 'xss';

import { getTeamBySlug, getGameByGameId } from './db.js';

export function validationCheck(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      const errors = validation.array();
      return res.status(400).json({ errors });
    }
  
    return next();
  }
  
  export function atLeastOneBodyValueValidator(fields: string[]) {
    return body().custom((value, { req }) => {
      const reqBody = req.body;
      const isValid = fields.some((field) => reqBody[field] != null);
      if (!isValid) {
        throw new Error(`At least one of the following fields is required: ${fields.join(', ')}`);
      }
      return true;
    });
  }
  
  export const xssSanitizer = (param: string) => 
    body(param).customSanitizer((v) => xss(v));
  
  export const xssSanitizerMany = (params: string[]) => 
    params.map((param) => xssSanitizer(param));
  
  export const genericSanitizer = (param: string) => 
    body(param).trim().escape();
  
  export const genericSanitizerMany = (params: string[]) => 
    params.map((param) => genericSanitizer(param));
  
  export const stringValidator = ({
    field = '',
    valueRequired = true,
    maxLength = 0,
    minLength = 0,
    optional = false,
  } = {}) => {
    let validatorChain = body(field).trim().isString().withMessage(`${field} must be a string`);
  
    if (minLength) {
      validatorChain = validatorChain.isLength({ min: minLength }).withMessage(`${field} must be at least ${minLength} characters`);
    }
    if (maxLength) {
      validatorChain = validatorChain.isLength({ max: maxLength }).withMessage(`${field} must be no more than ${maxLength} characters`);
    }
    if (valueRequired) {
      validatorChain = validatorChain.notEmpty().withMessage(`${field} is required`);
    }
    if (optional) {
      validatorChain = validatorChain.optional({ checkFalsy: true });
    }
  
    return validatorChain;
  };
  
  export const dateValidator = ({ field = 'date' } = {}) => {
    return body(field).custom((value) => {
      const inputDate = new Date(value);
      const currentDate = new Date();
      const twoMonthsAgo = new Date(new Date().setMonth(currentDate.getMonth() - 2));
  
      if (isNaN(inputDate.getTime())) {
        throw new Error('Invalid date format');
      }
      if (inputDate > currentDate) {
        throw new Error('Date cannot be in the future');
      }
      if (inputDate < twoMonthsAgo) {
        throw new Error('Date cannot be more than two months in the past');
      }
  
      return true;
    });
  };
  
  export const teamDoesNotExistValidator = body('name').custom(
    async (name) => {
      const slug = slugify(name, { lower: true, strict: true });
      const team = await getTeamBySlug(slug);
      if (team) {
        throw new Error('Team already exists');
      }
      return true;
    },
  );
  
  export const gameDoesNotExistValidator = body('gameId').custom(
    async (gameId) => {
      const game = await getGameByGameId(Number(gameId));
      if (game) {
        throw new Error('Game already exists');
      }
      return true;
    },
  );