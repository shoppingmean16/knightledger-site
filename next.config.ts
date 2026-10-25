import type { NextConfig } from 'next';
const config: NextConfig = { poweredByHeader:false, serverExternalPackages:['sharp'], async headers(){return [{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'Permissions-Policy',value:'geolocation=(), camera=(), microphone=()'},{key:'X-Frame-Options',value:'DENY'}]}]}};
export default config;
