import vine, {SimpleMessagesProvider } from '@vinejs/vine'

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

createNoteSchema.messagesProvider = new SimpleMessagesProvider({
  // Global rule messages
  'required': 'The {{ field }} is required.',
  'minLength': 'The {{ field }} must be at least {{ min }} characters.',
  'maxLength': 'The {{ field }} must not exceed {{ max }} characters.',
  'positive': 'The {{ field }} must be a positive number.',

  // Field-specific overrides (Optional)
  'type.enum': 'The {{ field }} must be either public or private.',
  'status.enum': 'The {{ field }} must be either draft or published.'
})

updateNoteSchema.messagesProvider = new SimpleMessagesProvider({
  // Global rule messages
  'minLength': 'The {{ field }} must be at least {{ min }} characters.',
  'maxLength': 'The {{ field }} must not exceed {{ max }} characters.',

  // Field-specific overrides (Optional)
  'type.enum': 'The {{ field }} must be either public or private.',
  'status.enum': 'The {{ field }} must be either draft or published.'
})

voteSchema.messagesProvider = new SimpleMessagesProvider({
  // Global rule messages
  'required': 'The {{ field }} is required.',

  // Field-specific overrides (Optional)
  'voteType.enum': 'The {{ field }} must be either upvote or downvote.',
})