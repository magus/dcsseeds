import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const headers = new Headers(request.headers);
  const user_agent = headers.get('user-agent');

  switch (true) {
    case RE.twitterbot.test(user_agent): {
      // console.info('REDIRECT FOR SEO', { user_agent });
      return NextResponse.rewrite(new URL('/seo', request.url));
    }

    default:
    // do nothing
  }
}

// match any route
export const config = {
  matcher: ['/', '/search'],
};

const RE = {
  twitterbot: /twitterbot/i,
};
