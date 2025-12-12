import vine from '@vinejs/vine'


export const createCompanySchema = vine.compile(
  vine.object({
    companyName: vine.string().minLength(1).maxLength(255),

    // Vine will pass a db-like object as first arg to the async predicate.
    // Return true if value is unique (valid), false if it already exists (invalid).
    companyHostname: vine
      .string()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9\-]+$/) // only lowercase letters, numbers, and hyphens
      .unique(async (db, value) => {
        const existing = await db.from('companies').where('hostname', value).first()
        return !existing
      }),

    ownerUsername: vine.string().minLength(3).maxLength(50),

    ownerEmail: vine
      .string()
      .email()
      .unique(async (db, value) => {
        const existing = await db.from('users').where('email', value).first()
        return !existing
      }),

    ownerPassword: vine.string().minLength(8),
  })
)


