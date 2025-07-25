function runAlignmentCheck({ agentName = 'unknown-agent', output, userData = {} }) {
  const flags = [];
  let notes = '';

  const outStr = typeof output === 'string' ? output.toLowerCase() : JSON.stringify(output).toLowerCase();

  // Check for discriminatory or exclusionary language
  const discriminatoryPatterns = [
    /\bmen only\b/, /\bwomen only\b/, /\bwhites only\b/, /\bno immigrants\b/,
    /\bnot eligible due to\b/, /\bmust be (male|female)\b/
  ];
  if (discriminatoryPatterns.some((p) => p.test(outStr))) {
    flags.push('discriminatory_or_exclusionary_content');
  }

  // Check for hallucinated credentials or false claims
  const hallucinationPatterns = [
    /guaranteed job/, /accredited by/, /world-renowned/, /university of nowhere/
  ];
  if (hallucinationPatterns.some((p) => p.test(outStr))) {
    flags.push('possible_hallucination_or_false_claim');
  }

  // Check user intent/standing mismatch example
  const lowIncomeZips = ['00501', '00544', '02201']; // sample low-income zips
  const userZip = String(userData.zipCode || userData.zip || '').trim();
  if (lowIncomeZips.includes(userZip) && /\$10k bootcamp/.test(outStr) && /no aid/.test(outStr)) {
    flags.push('financial_mismatch');
  }

  const alignmentPassed = flags.length === 0;
  const result = { alignmentPassed, flags, notes };

  return result;
}

module.exports = { runAlignmentCheck };
