/**
 * Claimable vendor seed + types.
 * Current seed: Columbia SC metro from Roaming Hunger + FoodTrucksIn.
 * Architecture is ready for bulk remote lists (city/country/search).
 */

export interface ClaimableVendor {
  id: string
  name: string
  cuisine?: string
  city?: string
  state?: string
  country?: string
  area?: string
  claimed: boolean
  claimedBy?: string
  claimedAt?: number
}

export const SEEDED_CLAIMABLE_VENDORS: Omit<
  ClaimableVendor,
  "claimed" | "claimedBy" | "claimedAt"
>[] = [
  // FoodTrucksIn.com – Columbia / Lexington / Irmo / West Columbia
  { id: "seed-carolina-cookin", name: "Carolina Cookin'", cuisine: "Barbeque", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-grumpys-cocina", name: "Grumpy's Cocina", cuisine: "Mexican Hot Dogs", city: "Irmo", state: "SC", country: "US", area: "Irmo, SC" },
  { id: "seed-glory-food-bus", name: "The Glory Food Bus", cuisine: "American, Seafood", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-rb-top-chef", name: "R.B. Top Chef", cuisine: "American", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-twisted-cherry-bomb", name: "Twisted Cherry Bomb", cuisine: "Barbeque", city: "Lexington", state: "SC", country: "US", area: "Lexington, SC" },
  { id: "seed-maui-wowi-lexington", name: "Maui Wowi of Lexington SC", cuisine: "Coffee, Smoothies", city: "Lexington", state: "SC", country: "US", area: "Lexington, SC" },
  { id: "seed-wurst-wagen", name: "The Wurst Wagen", cuisine: "German, Sausages", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-hometown-hot-dogz", name: "Hometown Hot Dogz", cuisine: "Hot Dogs", city: "Lexington", state: "SC", country: "US", area: "Lexington, SC" },
  { id: "seed-euro-bites", name: "Euro Bites Food Truck", cuisine: "Eclectic, Comfort Food", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-sarahs-rockin-kitchen", name: "Sarah's Rockin' Kitchen", cuisine: "Comfort Food", city: "Little Mountain", state: "SC", country: "US", area: "Little Mountain, SC" },
  { id: "seed-scott-bennys", name: "Scott Benny's", cuisine: "American, International", city: "West Columbia", state: "SC", country: "US", area: "West Columbia, SC" },
  { id: "seed-donut-guy", name: "The Donut Guy", cuisine: "Donuts, Desserts", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },

  // Roaming Hunger – Columbia
  { id: "seed-maurices-catering", name: "Maurice's Catering", cuisine: "Catering", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-bessies-bites", name: "Bessie's Bites & Sweet Delights", cuisine: "Desserts", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-kurts-kitchen", name: "Kurt's Kitchen Catering", cuisine: "Catering", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-loads-of-flavour", name: "L.O.A.D.S of Flavour", cuisine: "Southern", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-fleur-de-licious", name: "Fleur de Licious", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-streats", name: "strEATS", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-doko-smoke", name: "Doko Smoke Barbeque", cuisine: "Barbeque", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-tacos-ole", name: "Tacos Olé - SC", cuisine: "Tacos, Mexican", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-lunas-grill", name: "Luna's Grill", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-brown-shuga", name: "Brown Shuga Soul Food", cuisine: "Soul Food, Southern", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-haute-dog-lady", name: "The Haute Dog Lady", cuisine: "Hot Dogs", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-maineatz", name: "MainEatz", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-blue-collar-cafe", name: "Blue Collar Café Mobile Food", cuisine: "Southern", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-alsies-ice-cream", name: "Alsies Ice Cream Columbia, SC", cuisine: "Ice Cream", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-tru-italian-ice", name: "Tru Italian Ice", cuisine: "Italian Ice", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-browns-kabobbq", name: "Brown's KA-BOB-BQ", cuisine: "Kebabs, BBQ", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-cruisin-cuisine", name: "Cruisin Cuisine", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-la-dolce-vita", name: "La Dolce Vita Pizza", cuisine: "Pizza", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-brain-freeze", name: "Brain Freeze LLC", cuisine: "Frozen Treats", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-all-belgium-waffles", name: "All Belgium Waffles - Columbia", cuisine: "Waffles, Dessert", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-a-la-mode-cookie", name: "À la Mode Cookie Co.", cuisine: "Cookies, Dessert", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-size-matters-bbq", name: "Size Matters BBQ Bus", cuisine: "Barbeque", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-smoke-it-up", name: "Smoke It Up Food Truck", cuisine: "Barbeque", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-welcome2miami", name: "Welcome2Miami305", cuisine: "Cuban, Latin", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-ta-southern-eats", name: "T&A Southern Eats", cuisine: "Southern", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-bubblelicious", name: "Bubblelicious by Elevation Catering", cuisine: "Drinks, Dessert", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-break-nd-fast", name: "Break 'nd Fast", cuisine: "Breakfast", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-karens-kitchen", name: "Karen's Kitchen & Catering", cuisine: "Catering", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-celebrity-status", name: "Celebrity Status Catering", cuisine: "Catering", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-lick-ice-cream", name: "LICK Ice Cream Food Truck", cuisine: "Ice Cream", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-bone-in-bbq", name: "Bone-In Artisanal BBQ on Wheels", cuisine: "Barbeque", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
  { id: "seed-2-fat-2-fly", name: "2 Fat 2 Fly", city: "Columbia", state: "SC", country: "US", area: "Columbia, SC" },
]
