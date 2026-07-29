/**
 * Seeded claimable vendor names for Columbia, SC metro (30-mile radius).
 * Sources: Roaming Hunger Columbia list + FoodTrucksIn.com Columbia search.
 * These are UNCLAIMED profiles. Real vendors can claim their name.
 */

export interface ClaimableVendor {
  id: string
  name: string
  cuisine?: string
  area?: string
  claimed: boolean
  claimedBy?: string
  claimedAt?: number
}

export const SEEDED_CLAIMABLE_VENDORS: Omit<ClaimableVendor, "claimed" | "claimedBy" | "claimedAt">[] = [
  // From FoodTrucksIn.com (Columbia / Lexington / Irmo / West Columbia)
  { id: "seed-carolina-cookin", name: "Carolina Cookin'", cuisine: "Barbeque", area: "Columbia, SC" },
  { id: "seed-grumpys-cocina", name: "Grumpy's Cocina", cuisine: "Mexican Hot Dogs", area: "Irmo, SC" },
  { id: "seed-glory-food-bus", name: "The Glory Food Bus", cuisine: "American, Seafood", area: "Columbia, SC" },
  { id: "seed-rb-top-chef", name: "R.B. Top Chef", cuisine: "American", area: "Columbia, SC" },
  { id: "seed-twisted-cherry-bomb", name: "Twisted Cherry Bomb", cuisine: "Barbeque", area: "Lexington, SC" },
  { id: "seed-maui-wowi-lexington", name: "Maui Wowi of Lexington SC", cuisine: "Coffee, Smoothies", area: "Lexington, SC" },
  { id: "seed-wurst-wagen", name: "The Wurst Wagen", cuisine: "German, Sausages", area: "Columbia, SC" },
  { id: "seed-hometown-hot-dogz", name: "Hometown Hot Dogz", cuisine: "Hot Dogs", area: "Lexington, SC" },
  { id: "seed-euro-bites", name: "Euro Bites Food Truck", cuisine: "Eclectic, Comfort Food", area: "Columbia, SC" },
  { id: "seed-sarahs-rockin-kitchen", name: "Sarah's Rockin' Kitchen", cuisine: "Comfort Food", area: "Little Mountain, SC" },
  { id: "seed-scott-bennys", name: "Scott Benny's", cuisine: "American, International", area: "West Columbia, SC" },
  { id: "seed-donut-guy", name: "The Donut Guy", cuisine: "Donuts, Desserts", area: "Columbia, SC" },

  // From Roaming Hunger Columbia list
  { id: "seed-maurices-catering", name: "Maurice's Catering", cuisine: "Catering", area: "Columbia, SC" },
  { id: "seed-bessies-bites", name: "Bessie's Bites & Sweet Delights", cuisine: "Desserts", area: "Columbia, SC" },
  { id: "seed-kurts-kitchen", name: "Kurt's Kitchen Catering", cuisine: "Catering", area: "Columbia, SC" },
  { id: "seed-loads-of-flavour", name: "L.O.A.D.S of Flavour", cuisine: "Southern", area: "Columbia, SC" },
  { id: "seed-fleur-de-licious", name: "Fleur de Licious", cuisine: undefined, area: "Columbia, SC" },
  { id: "seed-streats", name: "strEATS", cuisine: undefined, area: "Columbia, SC" },
  { id: "seed-doko-smoke", name: "Doko Smoke Barbeque", cuisine: "Barbeque", area: "Columbia, SC" },
  { id: "seed-tacos-ole", name: "Tacos Olé - SC", cuisine: "Tacos, Mexican", area: "Columbia, SC" },
  { id: "seed-lunas-grill", name: "Luna's Grill", cuisine: undefined, area: "Columbia, SC" },
  { id: "seed-brown-shuga", name: "Brown Shuga Soul Food", cuisine: "Soul Food, Southern", area: "Columbia, SC" },
  { id: "seed-haute-dog-lady", name: "The Haute Dog Lady", cuisine: "Hot Dogs", area: "Columbia, SC" },
  { id: "seed-maineatz", name: "MainEatz", cuisine: undefined, area: "Columbia, SC" },
  { id: "seed-blue-collar-cafe", name: "Blue Collar Café Mobile Food", cuisine: "Southern", area: "Columbia, SC" },
  { id: "seed-alsies-ice-cream", name: "Alsies Ice Cream Columbia, SC", cuisine: "Ice Cream", area: "Columbia, SC" },
  { id: "seed-tru-italian-ice", name: "Tru Italian Ice", cuisine: "Italian Ice", area: "Columbia, SC" },
  { id: "seed-browns-kabobbq", name: "Brown's KA-BOB-BQ", cuisine: "Kebabs, BBQ", area: "Columbia, SC" },
  { id: "seed-cruisin-cuisine", name: "Cruisin Cuisine", cuisine: undefined, area: "Columbia, SC" },
  { id: "seed-la-dolce-vita", name: "La Dolce Vita Pizza", cuisine: "Pizza", area: "Columbia, SC" },
  { id: "seed-brain-freeze", name: "Brain Freeze LLC", cuisine: "Frozen Treats", area: "Columbia, SC" },
  { id: "seed-all-belgium-waffles", name: "All Belgium Waffles - Columbia", cuisine: "Waffles, Dessert", area: "Columbia, SC" },
  { id: "seed-a-la-mode-cookie", name: "À la Mode Cookie Co.", cuisine: "Cookies, Dessert", area: "Columbia, SC" },
  { id: "seed-size-matters-bbq", name: "Size Matters BBQ Bus", cuisine: "Barbeque", area: "Columbia, SC" },
  { id: "seed-smoke-it-up", name: "Smoke It Up Food Truck", cuisine: "Barbeque", area: "Columbia, SC" },
  { id: "seed-welcome2miami", name: "Welcome2Miami305", cuisine: "Cuban, Latin", area: "Columbia, SC" },
  { id: "seed-ta-southern-eats", name: "T&A Southern Eats", cuisine: "Southern", area: "Columbia, SC" },
  { id: "seed-bubblelicious", name: "Bubblelicious by Elevation Catering", cuisine: "Drinks, Dessert", area: "Columbia, SC" },
  { id: "seed-break-nd-fast", name: "Break 'nd Fast", cuisine: "Breakfast", area: "Columbia, SC" },
  { id: "seed-karens-kitchen", name: "Karen's Kitchen & Catering", cuisine: "Catering", area: "Columbia, SC" },
  { id: "seed-celebrity-status", name: "Celebrity Status Catering", cuisine: "Catering", area: "Columbia, SC" },
  { id: "seed-lick-ice-cream", name: "LICK Ice Cream Food Truck", cuisine: "Ice Cream", area: "Columbia, SC" },
  { id: "seed-bone-in-bbq", name: "Bone-In Artisanal BBQ on Wheels", cuisine: "Barbeque", area: "Columbia, SC" },
  { id: "seed-2-fat-2-fly", name: "2 Fat 2 Fly", cuisine: undefined, area: "Columbia, SC" },
]
