import test from "node:test";
import assert from "node:assert/strict";
import { REGISTRATION_CATEGORIES, getRegistrationCategoryBySlug } from "./categories.ts";
import en from "../../i18n/translations/en.ts";

function getAtPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, segment) => {
    if (node && typeof node === "object" && segment in node) {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, root);
}

test("every category has a unique slug and id", () => {
  const slugs = REGISTRATION_CATEGORIES.map((c) => c.slug);
  const ids = REGISTRATION_CATEGORIES.map((c) => c.id);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.equal(new Set(ids).size, ids.length);
});

test("getRegistrationCategoryBySlug resolves valid slugs and rejects invalid ones", () => {
  assert.equal(getRegistrationCategoryBySlug("athlete")?.id, "athlete");
  assert.equal(getRegistrationCategoryBySlug("abcxyz"), undefined);
});

test("every category has a formTitle string in en.ts", () => {
  for (const category of REGISTRATION_CATEGORIES) {
    const value = getAtPath(en, `registerHub.categories.${category.id}.formTitle`);
    assert.equal(typeof value, "string", `missing registerHub.categories.${category.id}.formTitle`);
  }
});

test("every non-athlete field has a label (and placeholder/options where declared) in en.ts", () => {
  for (const category of REGISTRATION_CATEGORIES) {
    if (!category.fields) continue;
    for (const field of category.fields) {
      const base = `registerHub.categories.${category.id}.fields.${field.id}`;
      const label = getAtPath(en, `${base}.label`);
      assert.equal(typeof label, "string", `missing ${base}.label`);

      if (field.type === "text" && field.hasPlaceholder) {
        const placeholder = getAtPath(en, `${base}.placeholder`);
        assert.equal(typeof placeholder, "string", `missing ${base}.placeholder`);
      }

      if (field.type === "select" || field.type === "multiselect") {
        for (const option of field.options) {
          const optionLabel = getAtPath(en, `${base}.options.${option}`);
          assert.equal(
            typeof optionLabel,
            "string",
            `missing ${base}.options.${option}`,
          );
        }
      }
    }
  }
});

test("athlete category has no generic field config (reuses the real form)", () => {
  const athlete = getRegistrationCategoryBySlug("athlete");
  assert.equal(athlete?.fields, undefined);
});
