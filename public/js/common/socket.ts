import type { SerializedFood } from "./food";
import type { SerializedPlayer } from "./player";
import type { SerializedVirus } from "./virus";
import type { SerializedWorld } from "./world";

/**
 * Events sent from the client to the be handled by the server
 */
export interface ServerEventsMap {
    join: (username: string) => void;
    direct_cells: (data: Record<string, { x: number; y: number; speedMultiplier: number }>) => void;
    eject: () => void;
    split: () => void;
}

/**
 * Events sent from the server to be handled by the client
 */
export interface ClientEventsMap {
    init: (data: SerializedWorld) => void;
    update_self: (data: SerializedPlayer) => void;
    update_player: (data: SerializedPlayer) => void;
    spawn_foods: (data: SerializedFood[]) => void;
    remove_player: (id: string) => void;
    remove_food: (id: string) => void;
    remove_virus: (id: string) => void;
    spawn_viruses: (data: SerializedVirus[]) => void;
    tick_players: (data: SerializedPlayer[]) => void;
    death: () => void;
}
