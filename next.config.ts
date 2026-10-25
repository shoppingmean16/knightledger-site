import type { NextConfig } from 'next';
const config: NextConfig = { poweredByHeader:false, serverExternalPackages:['sharp'], async headers(){return [{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'Permissions-Policy',value:'geolocation=(), camera=(), microphone=()'},{key:'X-Frame-Options',value:'SAMEORIGIN'},{key:'Content-Security-Policy',value:"frame-ancestors 'self'; object-src 'none'; base-uri 'self'"}]}]}};
export default config;
