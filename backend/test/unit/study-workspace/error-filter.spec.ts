import type { ArgumentsHost } from '@nestjs/common';
import { AuthenticationError } from '../../../src/infrastructure/access-token';
import { WorkspaceInputError, WorkspaceConflictError } from '../../../src/modules/study-workspace/domain/workspace';
import { WorkspaceNotFoundError, WorkspaceUnavailableError } from '../../../src/modules/study-workspace/application/errors';
import { WorkspaceErrorFilter } from '../../../src/modules/study-workspace/presentation/workspace-error.filter';
describe('workspace error contract; local response-host double only, HTTP covered separately',()=>{
 afterEach(()=>jest.restoreAllMocks());
 it.each([
  [new AuthenticationError(),401,'UNAUTHORIZED','Autenticação necessária.'],
  [new WorkspaceInputError(),400,'VALIDATION_ERROR','Entrada inválida.'],
  [new WorkspaceNotFoundError(),404,'NOT_FOUND','Recurso não encontrado.'],
  [new WorkspaceConflictError(),409,'WORKSPACE_CONFLICT','Não foi possível atualizar esta revisão da nota.'],
  [new WorkspaceUnavailableError('private SQL details'),503,'WORKSPACE_UNAVAILABLE','Espaço de estudo temporariamente indisponível.'],
 ] as const)('maps %p to its public status and safe body',(error,status,code,message)=>{
  const response={status:jest.fn().mockReturnThis(),json:jest.fn()};const host={switchToHttp:()=>({getResponse:()=>response})} as unknown as ArgumentsHost;
  const log=jest.spyOn(console,'info').mockImplementation(()=>undefined);new WorkspaceErrorFilter().catch(error,host);expect(response.status).toHaveBeenCalledWith(status);expect(response.json).toHaveBeenCalledWith({error:{code,message}});expect(log).toHaveBeenCalledWith(JSON.stringify({component:'http',code,status}));
 });
});
