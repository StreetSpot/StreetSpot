-- Phase 3: Clean Supabase Rebuild for StreetSpot

-- Custom Types
CREATE TYPE user_role AS ENUM ('finder', 'founder', 'admin');
CREATE TYPE location_status AS ENUM ('active', 'closed', 'moving', 'event_only');
CREATE TYPE event_visibility AS ENUM ('public', 'private');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'revoked');

-- Profiles (Extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'finder'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Businesses / Vendors
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Locations (Phase 6: Live Location System with freshness)
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address TEXT,
  status location_status DEFAULT 'active'::location_status NOT NULL,
  closing_time TIMESTAMPTZ,
  is_temporary BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Events (Phase 8: Events)
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE, -- Optional tie to a business
  title TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  visibility event_visibility DEFAULT 'public'::event_visibility NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Event Guests (Phase 9: Private Event Security)
CREATE TABLE event_guests (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status invitation_status DEFAULT 'pending'::invitation_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (event_id, user_id)
);

-- Favorites (Phase 10)
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, business_id)
);

-- Row Level Security (RLS) Enablement
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies

-- Profiles: Anyone can read, users can update their own
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Businesses: Anyone can read, owners can insert/update
CREATE POLICY "Businesses are viewable by everyone." ON businesses FOR SELECT USING (true);
CREATE POLICY "Owners can manage businesses." ON businesses FOR ALL USING (auth.uid() = owner_id);

-- Locations: Anyone can read, business owners can manage
CREATE POLICY "Locations are viewable by everyone." ON locations FOR SELECT USING (true);
CREATE POLICY "Business owners can manage locations." ON locations FOR ALL USING (
  auth.uid() IN (SELECT owner_id FROM businesses WHERE id = locations.business_id)
);

-- Events: Public are viewable by everyone. Private are viewable by host and accepted/pending guests.
CREATE POLICY "Public events and permitted private events are viewable." ON events FOR SELECT USING (
  visibility = 'public' 
  OR host_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM event_guests 
    WHERE event_id = events.id 
    AND user_id = auth.uid() 
    AND status != 'revoked'
  )
);
CREATE POLICY "Hosts can manage events." ON events FOR ALL USING (auth.uid() = host_id);

-- Event Guests: Hosts can view and manage all guests for their events. Guests can view their own invitations.
CREATE POLICY "Hosts can manage their event guests." ON event_guests FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE id = event_guests.event_id AND host_id = auth.uid())
);
CREATE POLICY "Users can view and update their own guest status." ON event_guests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own guest status." ON event_guests FOR UPDATE USING (user_id = auth.uid());

-- Favorites: Users manage their own
CREATE POLICY "Users manage own favorites." ON favorites FOR ALL USING (user_id = auth.uid());

-- Helper Functions
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
