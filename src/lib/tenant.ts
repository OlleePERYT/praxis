type PracticeFromHeaders = {
  id: number;
  subdomain: string;
  name: string;
};

export function getPracticeFromHeaders(
  headers: Headers,
): PracticeFromHeaders | null {
  const practiceIdHeader = headers.get("x-practice-id");
  const practiceSubdomain = headers.get("x-practice-subdomain");

  if (!practiceIdHeader || !practiceSubdomain) {
    return null;
  }

  const practiceId = Number(practiceIdHeader);
  if (!Number.isInteger(practiceId) || practiceId <= 0) {
    return null;
  }

  const practiceName = headers.get("x-practice-name") ?? practiceSubdomain;

  return {
    id: practiceId,
    subdomain: practiceSubdomain,
    name: practiceName,
  };
}
