-- Fiche produit : Quantité avant « visiteurs en direct » (UX conversion)

update public.product_page_blocks
set position = 5
where id = 'ppb-quantity';

update public.product_page_blocks
set position = 7
where id = 'ppb-live-viewers';
