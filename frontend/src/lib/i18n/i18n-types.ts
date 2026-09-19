import type { en } from "./catalogs/en";

export type LocaleCatalog = {
  [Key in keyof typeof en]: {
    [NestedKey in keyof (typeof en)[Key]]: (typeof en)[Key][NestedKey] extends string
      ? string
      : {
          [
            LeafKey in keyof (typeof en)[Key][NestedKey]
          ]: (typeof en)[Key][NestedKey][LeafKey] extends string ? string : never;
        };
  };
};
