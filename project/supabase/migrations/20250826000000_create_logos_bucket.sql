-- Create storage bucket 'logos' and basic policies
select storage.create_bucket('logos', public := true);

-- Allow public read
create policy "Public can read logos"
  on storage.objects for select
  to public
  using (bucket_id = 'logos');

-- Allow unauthenticated/public uploads (no auth required)
create policy "Anyone can upload logos"
  on storage.objects for insert
  to public
  with check (bucket_id = 'logos');
