import vine from '@vinejs/vine'


export const registerSchema = vine.compile(
  vine.object({
    username: vine.string().minLength(3).maxLength(50),
    email: vine.string().email().unique(async (db, value) => {
      const existing = await db.from('users').where('email', value).first()
      return !existing
    }),
    password: vine.string().minLength(8),
  })
)

export const loginSchema = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
  })
)

export const updateUserSchema = vine.compile(
  vine.object({
    username: vine.string().minLength(3).maxLength(50).optional(),
    password: vine.string().minLength(8).optional(),
  })
)
