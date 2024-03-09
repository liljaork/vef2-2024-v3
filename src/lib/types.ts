export type Team = {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export type Game = {
    id: number;
    date: Date;
    home: Team;
    away: Team;
    home_score: number;
    away_score: number;
}

export type GameDb = {
    id: number;
    date: Date;
    home: number; // id á team
    away: number; // id á team
    home_score: number;
    away_score: number;
};