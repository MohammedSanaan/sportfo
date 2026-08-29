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

test("every field belongs to exactly one fieldGroup, and every fieldGroup references only real fields", () => {
  for (const category of REGISTRATION_CATEGORIES) {
    if (!category.fields) continue;
    assert.ok(category.fieldGroups, `${category.id} has fields but no fieldGroups`);

    const fieldIds = category.fields.map((f) => f.id);
    const groupedIds = category.fieldGroups!.flatMap((g) => g.fieldIds);

    for (const id of fieldIds) {
      const occurrences = groupedIds.filter((g) => g === id).length;
      assert.equal(occurrences, 1, `${category.id}: field "${id}" appears in ${occurrences} groups (expected 1)`);
    }
    for (const id of groupedIds) {
      assert.ok(fieldIds.includes(id), `${category.id}: fieldGroup references unknown field "${id}"`);
    }
  }
});

test("every category's Profile Setup fieldGroup includes profilePhoto", () => {
  for (const category of REGISTRATION_CATEGORIES) {
    if (!category.fieldGroups) continue;
    const allGroupedIds = category.fieldGroups.flatMap((g) => g.fieldIds);
    assert.ok(
      allGroupedIds.includes("profilePhoto"),
      `${category.id}: no fieldGroup includes profilePhoto`,
    );
  }
});

test("every category has a heroImage", () => {
  for (const category of REGISTRATION_CATEGORIES) {
    assert.equal(typeof category.heroImage, "string", `${category.id} is missing heroImage`);
  }
});

test("every fieldGroup has a title (and description where present) in en.ts", () => {
  for (const category of REGISTRATION_CATEGORIES) {
    if (!category.fieldGroups) continue;
    for (const group of category.fieldGroups) {
      const base = `registerHub.categories.${category.id}.sections.${group.key}`;
      const title = getAtPath(en, `${base}.title`);
      assert.equal(typeof title, "string", `missing ${base}.title`);
    }
  }
});

test("every non-athlete category has a sidebar note in en.ts", () => {
  for (const category of REGISTRATION_CATEGORIES) {
    if (category.id === "athlete") continue;
    const base = `registerHub.categories.${category.id}.sidebar.note`;
    assert.equal(typeof getAtPath(en, `${base}.title`), "string", `missing ${base}.title`);
    assert.equal(typeof getAtPath(en, `${base}.description`), "string", `missing ${base}.description`);
  }
});
