---
name: "sfyb-blender-modeling"
description: "Use whenever adding or changing any 3D model, prop, wall, clothing kit or vehicle for Mesika's game Steal From Your Boss (BIG BUN) — build it in Blender, match the cartoon style, run measured checks and screenshots before wiring it in."
---

# Blender modeling for Steal From Your Boss

Mesika's rule #1: **every model, object, wall, garment or vehicle he asks for is built in Blender** (bpy script → GLB), loaded in the game's own loader, screenshotted and checked before it enters the game. Never hand-write geometry in three.js, never download a realistic asset, never leave a placeholder cube.

Project files: `tools/art/STYLE_GUIDE.md` (the guide below), `tools/art/blender_template.py` (starting script), `tools/art/reference/` (screenshots of every existing model + `model_stats.json`), `tools/art/removed_models.txt`.

## Process for every model request

1. **Read the style guide (below) and find the closest existing model** in `tools/art/reference/`. Note its triangle count, size and materials from `model_stats.json`.
2. **Write a spec first** (in a scratch `spec.json` or in your notes): named parts, real dimensions in metres, what attaches to what, material name per part from the palette. State the assumptions.
3. **Build from one editable bpy script** (start from `blender_template.py`). Parameters at the top. On each iteration make targeted edits to the script — never regenerate it from scratch, the model drifts.
4. **Blockout → form → materials**, in that order. Blockout with primitives at spec size; then lathe profiles, tapered parts, small bevels (2 segments, shade smooth); then materials (Principled BSDF, flat colour, no textures except signs/menus/floor tiles).
5. **Measure, don't trust your eyes.** After every build, run a check in Blender (bpy) for: floating parts (no contact with anything), gaps between parts that should touch, parts embedded deeper than intended, overall dims vs spec (±5 %), non-manifold geometry, triangle count vs the budget table. Treat any error as a failed gate even if the render looks fine.
6. **Render a review sheet**: FRONT | RIGHT | BACK | TOP orthographic, plus 3/4 views, **next to an existing model from the same set** for scale. Look at the image (Mesika's standing rule: look at every screenshot and check it makes logical sense — nothing clipping through anything, parts attached where they belong, plausible placement). Write up to 5 numbered critiques with concrete numeric fixes, edit the script, re-render, mark each critique fixed/not fixed.
7. **Load it in the game's loader** (GLTFLoader + MeshoptDecoder, the game's PMREM environment and NeutralToneMapping) and screenshot it in place with Playwright. Metals look dark without the environment — judge colour only under game lighting.
8. **Only then wire it in**: add the path to the allow-list in `client/js/world.js` (function `h` inside `load`) if it is outside the allowed folders, add a collision box to `restaurant.json` (`col`) for anything solid, and **re-hash `client/integrity.json`** (the guard checks SHA-256 of every JS file and index.html).
9. Report honestly: what was checked, what was not, and attach the review sheet.

Characters, faces and animals come out badly from code: for a new character reuse `little_agent.glb` and build only a **kit** (skinned clothes/accessories bound to the same 17 bones by name). See §2 of the guide.

## Critique checklist
- Proportions vs the reference model, not memory (common failure: everything too chunky — but this style *wants* slightly chunky, so compare to `reference/`).
- Every joint plausible; the check proves contact, you judge if it makes physical sense.
- Silhouette recognisable from the 3/4 views alone.
- No razor-sharp box edges; bevels visible but small.
- Mirrored parts match; things line up in TOP.
- Metals: metallic 0.7–1.0, roughness 0.2–0.5. Everything else metallic 0.

---

# STYLE_GUIDE.md (verbatim, Hebrew)

## כלל מספר 1
**כל דבר חדש — מודל, חפץ, קיר, בגד, רכב — נבנה בבלנדר** (סקריפט bpy, ייצוא GLB), נטען בלואדר של המשחק, מצולם ונבדק לפני שהוא נכנס למשחק. בסיס לסקריפט: `blender_template.py`.

## 1. הסגנון שאליו מכוונים: BIG BUN
הרפרנס הוא המסעדה (`made/restaurant/*`), הדמות `little_agent.glb`, הסמטה (`made/home/hideout.glb`) והעיר (`made/home/city.glb`).

- **קריקטורי־נקי, לא מציאותי.** צורות פשוטות עם פינות מעוגלות (bevel קטן, 2 סגמנטים, shade smooth). בלי שריטות, לכלוך, חלודה או סריקות תלת־ממד.
- **צבע אחיד לכל חומר** (baseColorFactor) במקום טקסטורות. טקסטורה רק לשלטים, לוגואים, תפריטים, פוסטרים ותבניות רצפה (משבצות).
- **צבעים רוויים וחמים.** אדום, קרם, חרדל, טורקיז, כרום. שחור כמעט אף פעם לא נקי.
- **פרופורציות מוגזמות במעט.** חפצים קצת עבים וחמודים, בלי פרטים קטנים שלא רואים בגוף ראשון.
- **מבחן:** אם המודל נראה כמו צילום, או "ברמה של GTA", הוא לא בסגנון.

### פלטת BIG BUN (ערכים לינאריים מתוך restaurant.glb, להעתיק בדיוק)
| חומר | RGB | Roughness | Metallic |
|---|---|---|---|
| rr_red (אדום מותג) | 0.74, 0.16, 0.12 | 0.45 | 0 |
| rr_cream | 0.93, 0.87, 0.74 | 0.6 | 0 |
| rr_must (חרדל) | 0.93, 0.66, 0.16 | 0.5 | 0 |
| rr_teal | 0.13, 0.47, 0.47 | 0.5 | 0 |
| rr_white | 0.90, 0.90, 0.88 | 0.4 | 0 |
| rr_dark | 0.06, 0.06, 0.07 | 0.5 | 0 |
| rr_chrome | 0.80, 0.81, 0.83 | 0.32 | 0.9 |
| rr_grimesteel | 0.42, 0.42, 0.42 | 0.6 | 0.7 |
| rr_cardboard | 0.62, 0.46, 0.28 | 0.85 | 0 |
| rr_gold (המשרד של הבוס) | 1.0, 0.74, 0.25 | 0.22 | 1.0 |
| rr_velvet (המשרד של הבוס) | 0.45, 0.04, 0.06 | 0.7 | 0 |
| rr_leather | 0.28, 0.12, 0.06 | 0.45 | 0 |
| מסכים ותאורה | emissive (rr_posscr 0.2/1.0/0.5, rr_heat 1.0/0.3/0.1) | 0.5 | 0 |

אוכל (items.glb): לחמנייה #e5b673, גבינה #ffdd61, חסה #a2dd7c, עגבנייה #ef6550. בהירים ו"צעצועיים".

## 2. דמויות
- **בסיס אחד לכולם:** `little_agent.glb`. דמות צ'יבי עם ראש גדול (גובה הריג כ־0.95 מ', הראש מתחיל ב־0.86), כ־42 אלף משולשים, 17 עצמות.
- **שמות העצמות (לא לשנות!):** hips, spine, chest, neck, head, armL/R, foreL/R, handL/R, thighL/R, shinL/R, footL/R. השורש נקרא `AgentRig`.
- **בגדים ואביזרים הם "קיטים":** קובץ GLB של SkinnedMesh שקשור לאותן 17 עצמות בדיוק, לפי שם (`uniform.js` → `wearKit`/`wearPick`). אם חסרה עצמה אחת, הקוד מדלג על הבגד. קיטים קיימים:
  - `uniform.glb`: סינר, כובע שף, חולצה אדומה.
  - `hair.glb`: 20 תסרוקות ואביזרים (`hair_*`, `acc_*`). צבע השיער נקבע בקוד דרך tint, ולכן החומר לבן.
  - `police.glb`, `manager.glb` (גארי: שפם, עניבה, תג), `contact.glb` (פדורה ומעיל).
- **שמות החומרים חשובים:** הסקינים (`skins.js`) צובעים את החומרים Jacket, Suit ו־Pants לפי השם. דמות חדשה חייבת לשמור על השמות האלה.
- **צבעי השחקנים:** כתום #ff9f2e, תכלת #3fc8ff, ירוק #7be34f, ורוד #ff5fd2.
- **אסור:** דמויות אנושיות מציאותיות. הסגנון הוא צ'יבי בלבד.

## 3. תקציבים (משולשים, מהמודלים שבמשחק)
| סוג | טווח | דוגמאות |
|---|---|---|
| חפץ ביד / קטן | 200–2,500 | soda_can 2.3k, pistol 2k, police (כובע) 2k |
| קיט בגדים | 800–18k | manager 848, contact 1.8k, uniform 17.7k |
| ערימת חפצים / שלל | עד ~40k לקובץ שמכיל הרבה חפצים | items 25.8k, loot 41.5k |
| רכב | ~6.5k | police_car 6.5k |
| דמות | ~42k | little_agent 41.7k |
| שלב שלם | ~180k | restaurant.glb 182k |

## 4. יחידות וייצוא
- **קנה מידה:** 1 יחידה = 1 מטר, ציר Y למעלה (ייצוא glTF עם `export_yup`). הרצפה ב־Y=0, נקודת הציר במרכז הבסיס.
- **מידות ייחוס מהמסעדה:** קירות בגובה 3 מ' (במקומות מסוימים 4.2 מ'), דלת ברוחב כ־1.2 מ'. הגבולות הפנימיים של המסעדה הם x ‎-11..11, z ‎-9..9. נקודות ההתנגשות נמצאות ב־`restaurant.json` (`col`: תיבות x0/x1/y0/y1/z0/z1). קיר חדש חייב גם תיבה שם.
- **חומרים:** Principled BSDF בלבד, צבע + roughness + metallic. לתת שם עם קידומת לפי הסט (`rr_` למסעדה, `ri_` לחפצים, `rl_` לשלל, `kit_` לבגדים).
- **אור במשחק:** סביבת PMREM מהסצנה ו־NeutralToneMapping. מתכת מבריקה נראית כהה בלי סביבה, אז לבדוק בצילום עם תאורה של המשחק.
- **דחיסה:** חלק מהקבצים דחוסים ב־meshopt ו־WebP. בלנדר לא פותח קבצי meshopt, ולכן לעריכת מודל קיים בונים אותו מחדש בסקריפט ולא מייבאים.

## 5. מה כבר לא במשחק
ב־3 בנובמבר 2026 נמחקו 180 מודלים של המשחק הקודם (Escape Office). `world.js` כבר לא מבקש אותם, וכל מודל חדש שנכנס צריך להיות בתוך `made/restaurant/`, `made/home/city|hideout`, `made/soda_can` או `little_agent`. אחרת צריך להוסיף את הנתיב שלו לרשימה המותרת שב־`world.js` (הפונקציה `h` בתוך `load`).

## 7. תהליך עבודה לכל בקשה
1. לקרוא את המדריך ולמצוא מודל קרוב ב־`reference/`.
2. לבנות בבלנדר בסקריפט, עם הפלטה, התקציב והקנה מידה שלמעלה.
3. לייצא GLB, לטעון ב־GLTFLoader + MeshoptDecoder של המשחק, לצלם מ־3 זוויות ליד מודל קיים מאותו סט ולבדוק קנה מידה, צבע וסגנון.
4. לבדוק שאין חלקים שחודרים זה לזה, שאין חלקים מרחפים ושהכול מחובר במקום הנכון. אם יש בעיה, לתקן ולצלם שוב.
5. רק אז לחבר לקוד ולעדכן את `integrity.json`.