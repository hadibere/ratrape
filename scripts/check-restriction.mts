/** Vérifie que l'échappatoire de développement ne peut pas fuiter en production. `pnpm check:restriction` */
const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

/** NODE_ENV est typé en lecture seule : on passe par la forme brute de l'environnement. */
const env = process.env as Record<string, string | undefined>;
const setEnv = (key: string, value: string | undefined) => {
  if (value === undefined) delete env[key];
  else env[key] = value;
};

const original = { node: env.NODE_ENV, flag: env.NEXT_PUBLIC_RATRAPE_ANYWHERE };

async function restrictedWith(nodeEnv: string, flag: string | undefined): Promise<boolean> {
  setEnv("NODE_ENV", nodeEnv);
  setEnv("NEXT_PUBLIC_RATRAPE_ANYWHERE", flag);
  // Import frais à chaque fois : la fonction lit l'environnement à l'appel.
  const { locationRestricted } = await import(`@/lib/commune?${Math.random()}`);
  return locationRestricted();
}

ok("production sans variable : restreint", await restrictedWith("production", undefined));
ok("production AVEC la variable : restreint quand même", await restrictedWith("production", "1"));
ok("développement sans variable : restreint", await restrictedWith("development", undefined));
ok("développement avec la variable : libre", !(await restrictedWith("development", "1")));
ok("développement avec une autre valeur : restreint", await restrictedWith("development", "oui"));

setEnv("NODE_ENV", original.node);
setEnv("NEXT_PUBLIC_RATRAPE_ANYWHERE", original.flag);
process.exit(0);
