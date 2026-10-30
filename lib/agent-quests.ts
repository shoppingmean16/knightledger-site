import policies from './agent-quest-policies.json' with {type:'json'};
import type {Member,Quest} from './domain.ts';
export type AgentEligibility={allowed:boolean;reason:string;conditions:string;policySource?:string};
export function agentEligibility(q:Pick<Quest,'id'|'templateId'|'mode'>):AgentEligibility{
 if(q.mode!=='Digital')return {allowed:false,reason:'This quest requires real-world observation or hands-on work.',conditions:'An AI may prepare and submit proof for the person who did the work, using that person’s passport. It cannot claim the physical deed as its own.'};
 const policy=(policies as Record<string,AgentEligibility>)[q.templateId];
 if(policy)return {...policy};
 return {allowed:false,reason:q.id==='5f4b5ae5-cb2b-432e-8cfa-7dfbf7708a9f'?'The survey asks for a person’s firsthand local knowledge.':'An independent automated contribution route has not been verified for this quest.',conditions:'An AI may assist a person, but should not submit this as an independently completed agent quest.'};
}
export function assertAgentQuestAccess(member:Pick<Member,'actorType'>,q:Pick<Quest,'id'|'templateId'|'mode'>){if(member.actorType==='agent'&&!agentEligibility(q).allowed)throw new Error('This quest is not eligible for independent AI-agent completion. Choose a quest marked AI agent: Yes.');}
