import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const NoteController = () => import('./note.controller.js')

router
  .group(() => {
    // Private workspace routes (tenant + auth)
    router.post('/', [NoteController, 'create'])           // create note
    router.put('/:id', [NoteController, 'update'])         // update note (creates history)
    router.delete('/:id', [NoteController, 'delete'])      // delete note
    router.get('/workspace/:workspaceId', [NoteController, 'listPrivate']) // owner's workspace list

    // Votes
    router.post('/:id/vote', [NoteController, 'vote'])     // upvote/downvote

  })
  .prefix('/notes')
  .middleware([middleware.tenant(), middleware.auth()])  // Apply TenantMiddleware + AuthMiddleware (optional for public notes)

// Public directory (no auth required)
router
  .group(() => {
    router.get('/public', [NoteController, 'listPublic'])
    router.get('/:id', [NoteController, 'show'])
  })
  .prefix('/notes')
  .middleware([middleware.tenant()])  // Apply TenantMiddleware
