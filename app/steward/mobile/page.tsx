import { notFound } from 'next/navigation';
export const metadata={title:"Mobile preview",robots:{index:false,follow:false}};
export default function MobilePreview(){if(process.env.KNIGHTLEDGER_PUBLIC_SITE==='true')notFound();return <section style={{padding:"30px 15px",textAlign:"center"}}><p style={{fontSize:11}}>Responsive verification · 390 px wide · actual page in a narrow viewport</p><iframe src="/" title="KnightLedger mobile viewport" width="390" height="844" style={{maxWidth:"100%",border:"1px solid #9c7737",background:"#f4ecdc"}}/></section>}
