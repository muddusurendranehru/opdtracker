/*
  # Create OPD Records Table

  1. New Tables
    - `opd_records`
      - `id` (uuid, primary key)
      - `date` (date) - The date of the OPD session
      - `name` (text) - Patient name
      - `review` (text) - Type of review/consultation
      - `free` (boolean) - Whether consultation is free
      - `amount` (numeric) - Base consultation amount
      - `include_two_e` (boolean) - Whether 2E is included
      - `two_e` (numeric) - 2E amount
      - `include_lab` (boolean) - Whether lab tests are included
      - `lab` (numeric) - Lab test amount
      - `observations` (text) - Doctor's observations/notes
      - `include_extra` (boolean) - Whether extra charges are included
      - `extra` (numeric) - Extra charges amount
      - `total` (numeric) - Total amount for the record
      - `created_at` (timestamptz) - Record creation time
      - `updated_at` (timestamptz) - Record last update time

  2. Security
    - Enable RLS on `opd_records` table
    - Add policies for public access (since this is a clinic management system)
*/

CREATE TABLE IF NOT EXISTS opd_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  name text NOT NULL DEFAULT '',
  review text DEFAULT '',
  free boolean DEFAULT false,
  amount numeric DEFAULT 0,
  include_two_e boolean DEFAULT false,
  two_e numeric DEFAULT 0,
  include_lab boolean DEFAULT false,
  lab numeric DEFAULT 0,
  observations text DEFAULT '',
  include_extra boolean DEFAULT false,
  extra numeric DEFAULT 0,
  total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE opd_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
CREATE POLICY "Allow public read access to opd_records"
  ON opd_records
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to opd_records"
  ON opd_records
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to opd_records"
  ON opd_records
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to opd_records"
  ON opd_records
  FOR DELETE
  TO public
  USING (true);

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_opd_records_date ON opd_records(date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_opd_records_updated_at
  BEFORE UPDATE ON opd_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();