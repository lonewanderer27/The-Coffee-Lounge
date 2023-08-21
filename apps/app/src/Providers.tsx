import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RecoilRoot } from "recoil";

const queryClient = new QueryClient();

export const Providers = (props: {
  children: React.ReactNode;
}) => {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </RecoilRoot>
  );
}