import xior, { type XiorError } from "xior";

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

export const http = xior.create({
  baseURL: `${baseURL}/api`,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

http.interceptors.response.use(
  (res) => res,
  (error: XiorError) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      const next = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      if (!window.location.pathname.startsWith("/sign-in")) {
        window.location.href = `/sign-in?next=${next}`;
      }
    }
    return Promise.reject(error);
  },
);

export type ApiError = XiorError;
