/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() { return [
    {source:'/dashboard',destination:'/#business',permanent:false},
    {source:'/close-process',destination:'/#business',permanent:false}
  ]; },
  async headers() { return [{source:'/(.*)',headers:[
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'X-Frame-Options',value:'DENY'}
  ]}]; }
};
