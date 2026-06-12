import { createRefreshAuthRouter } from "@insforge/sdk/ssr";

const refreshRouter = createRefreshAuthRouter();

export async function POST(request: Request): Promise<Response> {
  try {
    return await refreshRouter.POST(request);
  } catch (error) {
    console.error("[api/auth/refresh]", error);
    return Response.json(
      {
        error: "REFRESH_FAILED",
        message: "Unable to refresh session",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
