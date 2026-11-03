import {reviewAllowed} from './lib/noise/review-access';
import {NextResponse,type NextRequest} from 'next/server';
/** Review harnesses may only run locally or on the isolated preview hostname. */
export function middleware(request:NextRequest){
 const host=request.nextUrl.hostname;
 if(!reviewAllowed(host,process.env.NODE_ENV))
  return new NextResponse('Not found',{status:404});
 return NextResponse.next();
}
export const config={matcher:['/type-review/:path*','/intro-review/:path*']};
