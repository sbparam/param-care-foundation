// Global function to generate a unique slug
export const generateUniqueSlug = async (
  baseSlug: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> => {
  let generatedSlug = baseSlug;
  let slugSuffix = 1;

  while (await slugExists(generatedSlug)) {
    generatedSlug = `${baseSlug}-${slugSuffix}`;
    slugSuffix++;
  }
  return generatedSlug;
};
