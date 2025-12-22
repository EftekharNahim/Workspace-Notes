
import vine,{SimpleMessagesProvider} from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  // Global rule messages
  'required': 'The {{ field }} is required.',
  'unique': 'The {{ field }} has already been taken.',
  'email': 'The {{ field }} must be a valid email address.',
  'minLength': 'The {{ field }} must be at least {{ min }} characters.',
  'maxLength': 'The {{ field }} must not exceed {{ max }} characters.',

  // Field-specific overrides (Optional)
  'email.unique': 'The email has already been registered.',
})
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
