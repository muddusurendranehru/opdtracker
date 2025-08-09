/*
  # Create new patient_records table with clean column names

  1. New Tables
    - `patient_records`
      - `id` (uuid, primary key)
      - `record_date` (date)
      - `patient_name` (text)
      - `visit_type` (text)
      - `is_free` (boolean)
      - `consultation_fee` (numeric)
      - `include_procedure` (boolean)
      - `procedure_fee` (numeric)
      - `include_tests` (boolean)
      - `test_fee` (numeric)
      - `include_additional` (boolean)
      - `additional_fee` (numeric)
      - `notes` (text)
      - `total_amount` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `patient_records` table
    - Add policy for public access (as per current setup)

  3. Features
    - Auto-update timestamp trigger
    - Indexed by date for fast queries
    - Clean, descriptive column names
*/

-- Create the new patient_records table
CREATE TABLE IF NOT EXISTS patient_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL,
  patient_name text NOT NULL DEFAULT '',
  visit_type text DEFAULT '',
  is_free boolean DEFAULT false,
  consultation_fee numeric DEFAULT 0,
  include_procedure boolean DEFAULT false,
  procedure_fee numeric DEFAULT 0,
  include_tests boolean DEFAULT false,
  test_fee numeric DEFAULT 0,
  include_additional boolean DEFAULT false,
  additional_fee numeric DEFAULT 0,
  notes text DEFAULT '',
  total_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching your current setup)
CREATE POLICY "Allow public read access to patient_records"
  ON patient_records
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to patient_records"
  ON patient_records
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to patient_records"
  ON patient_records
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to patient_records"
  ON patient_records
  FOR DELETE
  TO public
  USING (true);

-- Create index for fast date queries
CREATE INDEX IF NOT EXISTS idx_patient_records_date ON patient_records (record_date);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_patient_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_patient_records_updated_at
  BEFORE UPDATE ON patient_records
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_records_updated_at();