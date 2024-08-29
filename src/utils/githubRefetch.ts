import useFetchGithubContributions from "../hooks/useFetchGithubContributions";

let refetchGithub: (() => void) | null = null;

export const setRefetchGithub = (refetch: () => void) => {
  refetchGithub = refetch;
};

export const getRefetchGithub = () => {
  return refetchGithub;
};
