import { getTeam } from '../routes/teams.js';
import { getTeamBySlug, getTeamById } from './db.js';
import {
    Game,
    Team,
    GameDb
  } from './types.js';

/**
 * Map a potential game to a game.
 * @param potentialGame Data that might be a game.
 * @returns Mapped game or null if the data is not a game.
 */
export async function gameMapper(potentialGame: unknown): Promise<Game | null> {
    // Type cast the potential game to a Partial `GameDb` or null.
    // This allows us to use the optional chaining operator to safely access
    // properties on the potential game and mapping to a game if our
    // conditions are met.
    const game = potentialGame as Partial<GameDb> | null;

    if (!game || !game.id || !game.date || !game.home || !game.away || !game.home_score || !game.away_score) {
        return null;
    }

    const home_team = await getTeamById(game.home);
    const away_team = await getTeamById(game.away);

    if (!home_team || !away_team) {
            return null;
        }

    // Create exactly the game object we want to return, i.e. the mapped game.
    // This is not perfect since we are not checking if the values are of the
    // correct type, but we are assuming that the database returns the correct
    // types. We should probably add some validation...
    const mapped: Game = {
            id : game.id,
            date: new Date(game.date),
            home: home_team,
            away: away_team,
            home_score: game.home_score,
            away_score: game.away_score,
        };

    return mapped;
}

/**
 * Map a potential list of games to an array of games.
 * @param potentialGames Data that might be a list of games.
 * @returns Array of mapped games, empty if no games are mapped.
 */
export async function gamesMapper(potentialGames: GameDb[]): Promise<Game[]> {
    const games = potentialGames as unknown[] | null;

    if (!games || !Array.isArray(games)) {
        return [];
    }

    const mappedPromises = games.map(gameMapper);
    const mapped = await Promise.all(mappedPromises);

    // Filter out any null values from the mapped array using the `filter` method
    // and a type guard function.
    return mapped.filter((i): i is Game => Boolean(i));
}


/**
 * Map a potential team to a team.
 * @param potentialTeam Data that might be a team.
 * @param potentialGames Data that might be a list of games.
 * @returns Mapped team or null if the data is not a team.
 */
export function teamMapper(potentialTeam: Partial<Team>): Team | null {
    if (!potentialTeam.name || !potentialTeam.slug || !potentialTeam.id || !potentialTeam.description) {
      return null;
    }
  
    const mapped: Team = {
      id: potentialTeam.id, // kannski að setja default value? (potentialTeam.id ?? -1),
      name: potentialTeam.name,
      slug: potentialTeam.slug,
      description: potentialTeam.description ?? undefined,
    };
  
    return mapped;
}

/**
 * Map a potential array of teams to an array of teams.
 * @param potentialTeams Data that might be a list of teams.
 * @returns Array of mapped teams, empty if no teams are mapped.
 */
export function teamsMapper(potentialTeams: Partial<Team>[]): Team[] {
    return potentialTeams.map(teamMapper).filter((team): team is Team => team !== null);
  }