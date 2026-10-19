-- Store the existing claimable catalog in the database so claim requests can be verified and approved across devices.
alter table public.vendors add column if not exists seed_id text;
do $migration$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'vendors_seed_id_key' and conrelid = 'public.vendors'::regclass
  ) then
    alter table public.vendors add constraint vendors_seed_id_key unique (seed_id);
  end if;
end
$migration$;

comment on column public.vendors.seed_id is 'Stable identifier for an unclaimed catalog candidate; candidate rows have no public location until the owner verifies and publishes them.';

insert into public.vendors (seed_id, name, description, category, is_live, is_premium, closing_time)
values
('seed-carolina-cookin','Carolina Cookin''','Barbeque · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-grumpys-cocina','Grumpy''s Cocina','Mexican Hot Dogs · Irmo, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-glory-food-bus','The Glory Food Bus','American, Seafood · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-rb-top-chef','R.B. Top Chef','American · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-twisted-cherry-bomb','Twisted Cherry Bomb','Barbeque · Lexington, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-maui-wowi-lexington','Maui Wowi of Lexington SC','Coffee, Smoothies · Lexington, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-wurst-wagen','The Wurst Wagen','German, Sausages · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-hometown-hot-dogz','Hometown Hot Dogz','Hot Dogs · Lexington, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-euro-bites','Euro Bites Food Truck','Eclectic, Comfort Food · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-sarahs-rockin-kitchen','Sarah''s Rockin'' Kitchen','Comfort Food · Little Mountain, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-scott-bennys','Scott Benny''s','American, International · West Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-donut-guy','The Donut Guy','Donuts, Desserts · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-maurices-catering','Maurice''s Catering','Catering · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-bessies-bites','Bessie''s Bites & Sweet Delights','Desserts · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-kurts-kitchen','Kurt''s Kitchen Catering','Catering · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-loads-of-flavour','L.O.A.D.S of Flavour','Southern · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-fleur-de-licious','Fleur de Licious','Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-streats','strEATS','Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-doko-smoke','Doko Smoke Barbeque','Barbeque · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-tacos-ole','Tacos Olé - SC','Tacos, Mexican · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-lunas-grill','Luna''s Grill','Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-brown-shuga','Brown Shuga Soul Food','Soul Food, Southern · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-haute-dog-lady','The Haute Dog Lady','Hot Dogs · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-maineatz','MainEatz','Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-blue-collar-cafe','Blue Collar Café Mobile Food','Southern · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-alsies-ice-cream','Alsies Ice Cream Columbia, SC','Ice Cream · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-tru-italian-ice','Tru Italian Ice','Italian Ice · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-browns-kabobbq','Brown''s KA-BOB-BQ','Kebabs, BBQ · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-cruisin-cuisine','Cruisin Cuisine','Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-la-dolce-vita','La Dolce Vita Pizza','Pizza · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-brain-freeze','Brain Freeze LLC','Frozen Treats · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-all-belgium-waffles','All Belgium Waffles - Columbia','Waffles, Dessert · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-a-la-mode-cookie','À la Mode Cookie Co.','Cookies, Dessert · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-size-matters-bbq','Size Matters BBQ Bus','Barbeque · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-smoke-it-up','Smoke It Up Food Truck','Barbeque · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-welcome2miami','Welcome2Miami305','Cuban, Latin · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-ta-southern-eats','T&A Southern Eats','Southern · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-bubblelicious','Bubblelicious by Elevation Catering','Drinks, Dessert · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-break-nd-fast','Break ''nd Fast','Breakfast · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-karens-kitchen','Karen''s Kitchen & Catering','Catering · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-celebrity-status','Celebrity Status Catering','Catering · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-lick-ice-cream','LICK Ice Cream Food Truck','Ice Cream · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-bone-in-bbq','Bone-In Artisanal BBQ on Wheels','Barbeque · Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00'),
('seed-2-fat-2-fly','2 Fat 2 Fly','Columbia, SC · Unclaimed candidate. Owner must verify details and set a live location before publishing.','vendor',false,false,'22:00')
on conflict (seed_id) do nothing;

