import vine from '@vinejs/vine'

export const createNoteSchema = vine.compile(
  vine.object({
    title: vine.string().minLength(1).maxLength(255),
    content: vine.string().optional(),
    tags: vine.array(vine.string().minLength(1).maxLength(50)).optional(),
    type: vine.enum(['public', 'private']).optional().transform(v => v || 'private'),
    status: vine.enum(['draft', 'published']).optional().transform(v => v || 'draft'),
    workspaceId: vine.number().positive(),
  })
)

export const updateNoteSchema = vine.compile(
  vine.object({
    title: vine.string().minLength(1).maxLength(255).optional(),
    content: vine.string().optional(),
    tags: vine.array(vine.string().minLength(1).maxLength(50)).optional(),
    type: vine.enum(['public', 'private']).optional(),
    status: vine.enum(['draft', 'published']).optional(),
  })
)

export const voteSchema = vine.compile(
  vine.object({
    voteType: vine.enum(['upvote', 'downvote']),
  })
)
