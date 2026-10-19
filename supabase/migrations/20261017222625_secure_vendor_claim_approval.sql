-- Staff-only atomic vendor claim approval. The authenticated app_metadata role is checked inside the function.
create or replace function public.approve_vendor_claim(p_claim_id uuid)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare claim_row public.vendor_claims%rowtype;
begin
  if (select auth.uid()) is null or (select auth.jwt() -> 'app_metadata' ->> 'role') not in ('admin','staff') then
    raise exception using errcode = '42501', message = 'Staff access required';
  end if;
  select * into claim_row from public.vendor_claims where id = p_claim_id and status = 'pending' for update;
  if not found then raise exception using errcode = '22023', message = 'Pending claim not found'; end if;
  update public.vendors set owner_id = claim_row.claimant_id, updated_at = now()
    where id = claim_row.vendor_id and owner_id is null;
  if not found then raise exception using errcode = '23505', message = 'Vendor already has an owner'; end if;
  update public.vendor_claims set status = 'approved', reviewed_at = now() where id = p_claim_id and status = 'pending';
  update public.vendor_claims set status = 'rejected', reviewed_at = now()
    where vendor_id = claim_row.vendor_id and id <> p_claim_id and status = 'pending';
  return true;
end;
$$;
revoke all on function public.approve_vendor_claim(uuid) from public, anon;
grant execute on function public.approve_vendor_claim(uuid) to authenticated;
