import { Request, Response, NextFunction} from 'express';
import slugify from 'slugify';

import { Team } from '../lib/types.js';
import { teamMapper } from '../lib/mappers.js';
import { getTeams, getTeamBySlug, deleteTeamBySlug, insertTeam, conditionalUpdate } from '../lib/db.js';
import { atLeastOneBodyValueValidator, genericSanitizer, stringValidator, teamDoesNotExistValidator, validationCheck, xssSanitizer } from '../lib/validation.js';

export async function listTeams(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const teams = await getTeams(); 
  
    if (!teams) {
      return next(new Error('unable to get teams'));
    }
  
    return res.json(teams);
  }

export async function getTeam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;

  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  return res.json(team);
}

export async function createTeamHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name, description } = req.body;

  const teamToCreate: Omit<Team, 'id'> = {
    name,
    slug: slugify(name),
    description
  };

  const createdDeprtment = await insertTeam(teamToCreate, false);

  if (!createdDeprtment) {
    return next(new Error('unable to create team'));
  }

  return res.status(201).json(createdDeprtment);
}

export const createTeam = [
  stringValidator({ field: 'name', maxLength: 64 }),
  stringValidator({
    field: 'description',
    valueRequired: false,
    maxLength: 1000,
  }),
  teamDoesNotExistValidator,
  xssSanitizer('name'),
  xssSanitizer('description'),
  validationCheck,
  genericSanitizer('name'),
  genericSanitizer('description'),
  createTeamHandler,
];

export const updateTeam = [
  stringValidator({ field: 'name', maxLength: 64, optional: true }),
  stringValidator({
    field: 'description',
    valueRequired: false,
    maxLength: 1000,
    optional: true,
  }),
  atLeastOneBodyValueValidator(['name', 'description']),
  xssSanitizer('name'),
  xssSanitizer('description'),
  validationCheck,
  updateTeamHandler,
];

export async function updateTeamHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;
  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const { name, description } = req.body;

  const fields = [
    typeof name === 'string' && name ? 'name' : null,
    typeof name === 'string' && name ? 'slug' : null,
    typeof description === 'string' && description ? 'description' : null,
  ];

  const values = [
    typeof name === 'string' && name ? name : null,
    typeof name === 'string' && name ? slugify(name).toLowerCase() : null,
    typeof description === 'string' && description ? description : null,
  ];

  const updated = await conditionalUpdate(
    'team',
    team.id, // ?????????????????
    fields,
    values,
  );

  if (!updated) {
    return next(new Error('unable to update team'));
  }

  const updatedTeam = teamMapper(updated.rows[0]);
  return res.json(updatedTeam);
}

export async function deleteTeam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;
  const team = await getTeamBySlug(slug);

  if (!team) {
    return next();
  }

  const result = await deleteTeamBySlug(slug);

  if (!result) {
    return next(new Error('unable to delete team'));
  }

  return res.status(204).json({});
}
