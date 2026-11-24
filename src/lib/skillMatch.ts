const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** True when an experience tag refers to the given skill (e.g. "Power Query" ~ "Power Query M"). */
export function tagMatchesSkill(tag: string, skill: string): boolean {
  const a = norm(tag);
  const b = norm(skill);
  if (!a || !b) return false;
  return a === b || a.startsWith(b + ' ') || b.startsWith(a + ' ');
}
