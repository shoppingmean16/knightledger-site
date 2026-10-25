import { load } from '@/lib/store';
import { privateLedger } from '@/lib/domain';
import { currentMember } from '@/lib/auth';
import { Ledger, Recovery } from '@/components/forms';
export const dynamic='force-dynamic';
export const metadata={title:'My Ledger',robots:{index:false,follow:false}};
export default async function MyLedger(){const {state}=await load();const member=await currentMember(state);return <div className="standard-page">{member?<Ledger data={privateLedger(state,member.id)!} localities={state.localities}/>:<Recovery/>}</div>}
