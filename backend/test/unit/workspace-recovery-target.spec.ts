import type { Database } from '../../src/infrastructure/database';
import { recoverWorkspaceTestSchema } from '../helpers/workspace-database';
it('refuses a different recovery identity before any DDL; explicit local target-guard double',async()=>{
 const execute=jest.fn();const database={client:{$queryRaw:jest.fn(async()=>[{db:'different',role:'different'}]),$executeRaw:execute,$executeRawUnsafe:execute}} as unknown as Database;
 await expect(recoverWorkspaceTestSchema(database)).rejects.toThrow('Unsafe workspace fixture target');expect(execute).not.toHaveBeenCalled();
});
