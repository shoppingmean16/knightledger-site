import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots{return process.env.KNIGHTLEDGER_PUBLIC_SITE==='true'?{rules:{userAgent:'*',allow:'/',disallow:['/api/','/ledger','/steward']},sitemap:'https://www.knightledger.com/sitemap.xml'}:{rules:{userAgent:'*',disallow:'/'}};}
