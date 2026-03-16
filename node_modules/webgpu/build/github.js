function fail(msg) {
  throw new Error(msg);
}

async function fetchGithub(url, params) {
  url = `https://api.github.com/${url.replaceAll(/\{(.*?)\}/g, (_, id) => params[id] ?? fail(`no: ${id}`))}`;
  console.log(url);
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (res.status !== 200) {
    const text = await res.text();
    throw new Error(`url: ${url}\n${text}`);
  }
  return await res.json();
}

export async function getLatestRelease(params) {
  return fetchGithub('repos/{owner}/{repo}/releases/latest', params);
}

export async function getLatestArtifacts(params) {
  return fetchGithub('repos/{owner}/{repo}/actions/artifacts', params);
}

export async function getRunArtifacts(params) {
  return fetchGithub('repos/{owner}/{repo}/actions/runs/{run_id}/artifacts', params);
}