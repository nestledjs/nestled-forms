import { getJestProjectsAsync } from '@nx/jest';

async function getConfig() {
  return {
    projects: await getJestProjectsAsync(),
  };
}

export default getConfig;
