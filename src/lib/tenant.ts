type PracticeFromHeaders = {
  subdomain: string;
};

export function getPracticeFromHeaders(
  headers: Headers,
): PracticeFromHeaders | null {
  const practiceSubdomain = headers.get("x-practice-subdomain");

  if (!practiceSubdomain) {
    return null;
  }

  return {
    subdomain: practiceSubdomain,
  };
}
