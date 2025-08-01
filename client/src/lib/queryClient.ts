import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: RequestInit
): Promise<Response> {
  // Firebase auth token'ı al
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };
  
  try {
    const { getAuth } = await import("firebase/auth");
    const auth = getAuth();
    
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Failed to get auth token for API request:", error);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    ...options,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get auth token from Firebase
    const { getAuth } = await import("firebase/auth");
    const auth = getAuth();
    
    let headers: Record<string, string> = {};
    
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Failed to get auth token:", error);
      }
    }

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
