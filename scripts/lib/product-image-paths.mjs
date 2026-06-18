export const PRODUCT_IMAGES_BUCKET = "product-images";
const VARIANT_PATTERN = /-(main|gallery|thumb)\.webp$/i;

export function objectPathFromUrl(url, supabaseUrl, bucket = PRODUCT_IMAGES_BUCKET) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const publicMarker = `/storage/v1/object/public/${bucket}/`;
  const idx = trimmed.indexOf(publicMarker);
  if (idx >= 0) {
    return decodeURIComponent(trimmed.slice(idx + publicMarker.length).split("?")[0]);
  }

  const base = supabaseUrl.replace(/\/$/, "");
  if (trimmed.startsWith(`${base}/`)) {
    const rest = trimmed.slice(base.length + 1);
    if (rest.startsWith(`${bucket}/`)) {
      return decodeURIComponent(rest.slice(bucket.length + 1).split("?")[0]);
    }
  }

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed.replace(/^\/+/, "");
  }

  return null;
}

/** Inclut les variantes dérivées (-main/-gallery/-thumb) quand l'URL canonique est référencée. */
export function expandUsedPaths(objectPath) {
  const used = new Set([objectPath]);
  if (VARIANT_PATTERN.test(objectPath)) {
    const base = objectPath.replace(VARIANT_PATTERN, "");
    for (const variant of ["main", "gallery", "thumb"]) {
      used.add(`${base}-${variant}.webp`);
    }
  }
  return used;
}

export function collectUsedPathsFromProducts(products, variants, supabaseUrl) {
  const used = new Set();

  const addUrl = (url) => {
    const objectPath = objectPathFromUrl(url, supabaseUrl);
    if (!objectPath) return;
    for (const p of expandUsedPaths(objectPath)) used.add(p);
  };

  for (const product of products ?? []) {
    addUrl(product.main_image_url);
    addUrl(product.image_url);
    for (const img of product.gallery_images ?? []) addUrl(img);
  }

  for (const variant of variants ?? []) {
    addUrl(variant.image_url);
  }

  return used;
}

export async function fetchUsedProductImagePaths(supabase, supabaseUrl) {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, main_image_url, image_url, gallery_images");

  if (productsError) throw new Error(`produits: ${productsError.message}`);

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, product_id, image_url");

  if (variantsError) throw new Error(`variantes: ${variantsError.message}`);

  return collectUsedPathsFromProducts(products, variants, supabaseUrl);
}

export async function listAllBucketFilePaths(supabase, bucket, prefix = "") {
  const paths = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(error.message);

    for (const item of data ?? []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id == null) {
        paths.push(...(await listAllBucketFilePaths(supabase, bucket, path)));
      } else {
        paths.push(path);
      }
    }

    if (!data || data.length < 1000) break;
    offset += 1000;
  }

  return paths;
}

export function formatKb(bytes) {
  if (bytes == null) return "—";
  return `${(bytes / 1024).toFixed(1)} KB`;
}
