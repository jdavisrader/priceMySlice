// Ingredient density table (g/ml) for cross-dimension unit conversion.
// Values sourced from USDA FoodData Central and King Arthur Flour culinary standards.
// Convention: dry goods measured by the spoon-and-level method.
//
// Matching uses normalized exact match (lowercase, trimmed).
// No fuzzy matching — a wrong density silently corrupts costs; null is safe.

type DensityEntry = {
  names: string[] // canonical name first, aliases after
  gPerMl: number  // grams per milliliter
}

const DENSITIES: DensityEntry[] = [
  // ── Flours ─────────────────────────────────────────────────────────────────
  { names: ['all-purpose flour', 'ap flour', 'plain flour', 'flour'],     gPerMl: 0.529 },
  { names: ['bread flour'],                                                 gPerMl: 0.529 },
  { names: ['cake flour'],                                                  gPerMl: 0.488 },
  { names: ['whole wheat flour', 'whole-wheat flour', 'wholemeal flour'],  gPerMl: 0.529 },
  { names: ['almond flour', 'almond meal'],                                 gPerMl: 0.385 },
  { names: ['coconut flour'],                                               gPerMl: 0.462 },
  { names: ['oat flour'],                                                   gPerMl: 0.399 },
  { names: ['rye flour'],                                                   gPerMl: 0.502 },
  { names: ['cornstarch', 'corn starch', 'cornflour'],                     gPerMl: 0.641 },
  { names: ['tapioca starch', 'tapioca flour'],                             gPerMl: 0.570 },
  { names: ['rice flour', 'white rice flour'],                              gPerMl: 0.630 },
  { names: ['semolina'],                                                    gPerMl: 0.609 },

  // ── Sugars ─────────────────────────────────────────────────────────────────
  { names: ['granulated sugar', 'white sugar', 'sugar'],                   gPerMl: 0.845 },
  { names: ['brown sugar', 'brown sugar (packed)', 'light brown sugar',
             'dark brown sugar'],                                           gPerMl: 0.925 },
  { names: ['powdered sugar', 'icing sugar', 'confectioners sugar',
             "confectioners' sugar"],                                       gPerMl: 0.561 },
  { names: ['caster sugar', 'superfine sugar'],                             gPerMl: 0.800 },
  { names: ['raw sugar', 'turbinado sugar', 'demerara sugar'],              gPerMl: 0.880 },

  // ── Fats ───────────────────────────────────────────────────────────────────
  { names: ['butter', 'butter (softened)', 'unsalted butter',
             'salted butter'],                                              gPerMl: 0.959 },
  { names: ['butter (melted)', 'melted butter'],                            gPerMl: 0.911 },
  { names: ['shortening', 'vegetable shortening'],                          gPerMl: 0.879 },
  { names: ['coconut oil', 'coconut oil (solid)'],                          gPerMl: 0.908 },
  { names: ['coconut oil (liquid)', 'coconut oil (melted)'],                gPerMl: 0.895 },
  { names: ['vegetable oil', 'canola oil', 'sunflower oil'],                gPerMl: 0.925 },
  { names: ['olive oil'],                                                   gPerMl: 0.911 },
  { names: ['lard'],                                                        gPerMl: 0.919 },

  // ── Liquids ────────────────────────────────────────────────────────────────
  { names: ['water'],                                                       gPerMl: 1.000 },
  { names: ['whole milk', 'milk'],                                          gPerMl: 1.030 },
  { names: ['skim milk', 'nonfat milk'],                                    gPerMl: 1.033 },
  { names: ['buttermilk'],                                                  gPerMl: 1.026 },
  { names: ['heavy cream', 'heavy whipping cream', 'double cream',
             'whipping cream'],                                             gPerMl: 1.005 },
  { names: ['sour cream'],                                                  gPerMl: 1.056 },
  { names: ['vanilla extract', 'vanilla'],                                  gPerMl: 0.879 },
  { names: ['honey'],                                                       gPerMl: 1.420 },
  { names: ['maple syrup'],                                                 gPerMl: 1.333 },
  { names: ['corn syrup', 'light corn syrup', 'dark corn syrup'],           gPerMl: 1.380 },
  { names: ['molasses', 'blackstrap molasses'],                             gPerMl: 1.413 },
  { names: ['lemon juice'],                                                 gPerMl: 1.046 },
  { names: ['orange juice'],                                                gPerMl: 1.046 },

  // ── Leaveners & spices ─────────────────────────────────────────────────────
  { names: ['baking powder'],                                               gPerMl: 0.900 },
  { names: ['baking soda', 'bicarbonate of soda', 'bicarb soda'],          gPerMl: 1.080 },
  { names: ['salt', 'fine salt', 'table salt', 'fine sea salt'],            gPerMl: 1.217 },
  { names: ['kosher salt'],                                                 gPerMl: 0.720 },
  { names: ['cocoa powder', 'unsweetened cocoa powder', 'dutch cocoa',
             'dutch-process cocoa'],                                        gPerMl: 0.541 },
  { names: ['cinnamon', 'ground cinnamon'],                                 gPerMl: 0.560 },
  { names: ['cream of tartar'],                                             gPerMl: 0.900 },
  { names: ['espresso powder', 'instant espresso'],                         gPerMl: 0.350 },
  { names: ['nutmeg', 'ground nutmeg'],                                     gPerMl: 0.480 },
  { names: ['ginger', 'ground ginger'],                                     gPerMl: 0.540 },
  { names: ['allspice', 'ground allspice'],                                 gPerMl: 0.510 },

  // ── Oats & grains ──────────────────────────────────────────────────────────
  { names: ['rolled oats', 'old-fashioned oats'],                           gPerMl: 0.340 },
  { names: ['quick oats', 'instant oats'],                                  gPerMl: 0.380 },

  // ── Mix-ins & other ────────────────────────────────────────────────────────
  { names: ['chocolate chips', 'semi-sweet chocolate chips',
             'dark chocolate chips'],                                       gPerMl: 0.720 },
  { names: ['shredded coconut', 'desiccated coconut'],                      gPerMl: 0.350 },
  { names: ['peanut butter'],                                               gPerMl: 1.080 },
  { names: ['cream cheese'],                                                gPerMl: 1.015 },
  { names: ['ricotta', 'ricotta cheese'],                                   gPerMl: 1.064 },
  { names: ['yogurt', 'plain yogurt', 'greek yogurt'],                      gPerMl: 1.056 },
  { names: ['sour cream'],                                                  gPerMl: 1.056 },
]

export function getDensity(ingredientName: string): number | null {
  const normalized = ingredientName.toLowerCase().trim().replace(/\s+/g, ' ')
  for (const entry of DENSITIES) {
    if (entry.names.some((n) => n === normalized)) return entry.gPerMl
  }
  return null
}

export function resolveIngredientDensity(ingredient: {
  name: string
  gPerMl: string | null
}): number | null {
  if (ingredient.gPerMl !== null) {
    const parsed = parseFloat(ingredient.gPerMl)
    if (!isNaN(parsed) && parsed > 0) return parsed
  }
  return getDensity(ingredient.name)
}
