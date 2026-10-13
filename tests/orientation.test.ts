import {it,expect} from 'vitest';
import {requiresRotation} from '../src/orientation';
import {TransitionGuard} from '../src/lifecycle';
it('phones require rotation in portrait but landscape and large desktop do not',()=>{expect(requiresRotation(390,844)).toBe(true);expect(requiresRotation(844,390)).toBe(false);expect(requiresRotation(1000,1200)).toBe(false)});
it('portrait rotation blocks a pending playback transition',async()=>{let width=844,height=390,committed=false;const guard=new TransitionGuard(()=>!requiresRotation(width,height));let resolve!:()=>void;const pending=guard.run(()=>new Promise<void>(r=>resolve=r),()=>committed=true);width=390;height=844;resolve();expect(await pending).toBe(false);expect(committed).toBe(false)});
