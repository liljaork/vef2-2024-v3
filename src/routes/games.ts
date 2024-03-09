import { Request, Response, NextFunction} from 'express';
import slugify from 'slugify';

import { Game } from '../lib/types.js';
import { gameMapper } from '../lib/mappers.js';
import { insertGame, conditionalUpdate, getTeamBySlug, getGamesByTeamId, getGameByGameId, deleteGameByGameId } from '../lib/db.js';
import { atLeastOneBodyValueValidator, genericSanitizerMany, stringValidator, validationCheck, xssSanitizerMany } from '../lib/validation.js';
import { body } from 'express-validator';

export async function listGames(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;

  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const games = await getGamesByTeamId(team.id);

  if (!games) {
    return next(new Error('unable to get games'));
  }

  return res.json(games);
}

export async function getGame(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { gameId } = req.params;

  const game = await getGameByGameId(Number(gameId));

  if (!game) {
    return next();
  }

  return res.json(game);
}

export async function createGamesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;
  const { date, home, away, home_score, away_score } = req.body;

  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const gameToCreate: Omit<Game, 'id'> = {
    date: new Date(date),
    home,
    away,
    home_score,
    away_score
  };

  const createdGame = await insertGame(gameToCreate);

  if (!createdGame) {
    return next(new Error('unable to create game'));
  }

  return res.json(gameMapper(createdGame));
}
