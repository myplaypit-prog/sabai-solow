import { load, save } from './storage';
import type { Trip } from './planner';
const KEY = 'ss.trips';
export async function listTrips(userId: string) { return (await load<Trip[]>(KEY, [])).filter((t) => t.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export async function getTrip(id: string) { return (await load<Trip[]>(KEY, [])).find((t) => t.id === id) ?? null; }
export async function putTrip(t: Trip) { const all = await load<Trip[]>(KEY, []); await save(KEY, [t, ...all.filter((x) => x.id !== t.id)]); }
export async function deleteTrip(id: string) { const all = await load<Trip[]>(KEY, []); await save(KEY, all.filter((x) => x.id !== id)); }
