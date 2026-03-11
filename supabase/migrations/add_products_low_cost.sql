-- Add low_cost column to products table for "Low cost" section on the home page.
-- Products with low_cost = true appear in both the main catalog and the "Low cost" section.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor) if you don't use Supabase migrations.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS low_cost boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN products.low_cost IS 'When true, product is shown in the home "Low cost" section in addition to the main catalog.';
