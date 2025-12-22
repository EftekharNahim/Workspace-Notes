import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  // Global rule messages
  'required': 'The {{ field }} is required.',
  'minLength': 'The {{ field }} must be at least {{ min }} characters.',
  'maxLength': 'The {{ field }} must not exceed {{ max }} characters.',
})

export const createWorkspaceSchema = vine.compile(
  vine.object({
    name: vine.string().minLength(2),
  })
)

export const updateWorkspaceSchema = vine.compile(
  vine.object({
    name: vine.string().minLength(2).optional(),
  })
)
