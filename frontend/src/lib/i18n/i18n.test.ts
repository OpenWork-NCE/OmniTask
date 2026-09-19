import { describe, expect, it } from "vitest";

import { en } from "./catalogs/en";
import { fr } from "./catalogs/fr";
import { flattenKeys } from "./i18n";

describe("localization catalogs", () => {
  it("keeps English and French catalogs structurally identical", () => {
    expect(flattenKeys(fr)).toEqual(flattenKeys(en));
  });

  it("provides natural French task and session copy", () => {
    expect(fr.tasks.actions.create).toBe("Créer une tâche");
    expect(fr.tasks.empty.title).toBe("Aucune tâche pour le moment");
    expect(fr.errors.sessionExpired).toBe("Votre session a expiré");
  });
});
