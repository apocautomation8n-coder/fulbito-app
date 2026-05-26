-- Permite crear canchas con cobro en club (MVP actual).
alter table public.courts drop constraint if exists courts_deposit_valid;

alter table public.courts add constraint courts_deposit_valid check (
  payment_mode in ('full', 'at_club')
  or (
    payment_mode = 'deposit'
    and deposit_amount is not null
    and deposit_amount > 0
    and deposit_amount <= price_per_slot
  )
);
