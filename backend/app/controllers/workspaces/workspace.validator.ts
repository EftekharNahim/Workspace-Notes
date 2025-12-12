import vine from '@vinejs/vine'

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
