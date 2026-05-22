// @ts-check
import { defineConfig } from 'astro/config';

// Extract repository owner and name from GitHub Actions context
// GITHUB_REPOSITORY_OWNER e.g., "another-org"
// GITHUB_REPOSITORY e.g., "another-org/ForkedPartVault"
const githubOwner = process.env.GITHUB_REPOSITORY_OWNER || 'jdegenstein';
const githubRepo = process.env.GITHUB_REPOSITORY 
  ? process.env.GITHUB_REPOSITORY.split('/')[1] 
  : 'OpenPartVault';

// https://astro.build/config
export default defineConfig({
  site: `https://${githubOwner}.github.io`,
  base: `/${githubRepo}`,
});
