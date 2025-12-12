import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const WorkspaceController = () => import('./workspace.controller.js')


router
  .group(() => {
    router.post('/', [WorkspaceController, 'create'])
    router.get('/', [WorkspaceController, 'list'])
    router.put('/:id', [WorkspaceController, 'update'])
    router.delete('/:id', [WorkspaceController, 'delete'])
  })
  .prefix('/workspaces')
  .middleware([middleware.tenant(),middleware.auth()])  // Apply TenantMiddleware
