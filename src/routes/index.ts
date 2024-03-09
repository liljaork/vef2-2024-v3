import express, { Request, Response, NextFunction} from 'express';

import { listTeams, createTeam, getTeam, updateTeam, deleteTeam } from './teams.js';
import { listGames, getGame } from './games.js';
// , createGame, updateGame, deleteGame } from './games-router.js';

export const apiRouter = express.Router();

export async function indexRoute(req: Request, res: Response) {
    return res.json([
      {
        href: '/teams',
        methods: ['GET', 'POST'],
      },
      {
        href: '/teams/:slug',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
      {
        href: '/games',
        methods: ['GET', 'POST'],
      },
      {
        href: '/games/:slug',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
    ]);
}

apiRouter.get('/', indexRoute);

apiRouter.get('/teams', listTeams);
apiRouter.post('/teams', createTeam);
apiRouter.get('/teams/:slug', getTeam);
apiRouter.patch('/teams/:slug', updateTeam);
apiRouter.delete('/teams/:slug', deleteTeam);

apiRouter.get('/games', listGames);
// apiRouter.post('/games', createGame);
apiRouter.get('/games/:id', getGame);
// apiRouter.patch('/games/:id', updateGame);
// apiRouter.delete('/games/:id', deleteGame);