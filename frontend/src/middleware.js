import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/journal(.*)',
  '/profile(.*)'
]);

const isPublic = createRouteMatcher([
  '/sso-callback(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/landing(.*)',
  '/'
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);

  // If logged in and hitting landing page, go to dashboard
  if (userId && url.pathname === '/') {
    return Response.redirect(new URL('/dashboard', req.url));
  }

  if (!isPublic(req) && isProtected(req)) {
    await auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
};
