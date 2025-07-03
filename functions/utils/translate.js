async function translateText(text = '', targetLang = 'en', sourceLang = 'auto') {
  const url = 'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=${encodeURIComponent(sourceLang)}` +
    `&tl=${encodeURIComponent(targetLang)}` +
    `&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`translateText ${res.status}`);
  }
  const data = await res.json();
  const translated = (data[0] || []).map((part) => part[0]).join('');
  return translated;
}

async function translateOutput(output, targetLang = 'en', sourceLang = 'auto') {
  if (typeof output === 'string') {
    return translateText(output, targetLang, sourceLang);
  }
  if (Array.isArray(output)) {
    const res = [];
    for (const item of output) {
      res.push(await translateOutput(item, targetLang, sourceLang));
    }
    return res;
  }
  if (output && typeof output === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(output)) {
      result[key] = await translateOutput(value, targetLang, sourceLang);
    }
    return result;
  }
  return output;
}

module.exports = { translateText, translateOutput };
