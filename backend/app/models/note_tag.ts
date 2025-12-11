import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Note from './note.js'
import Tag from './tag.js'

export default class NoteTag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare noteId: number

  @column()
  declare tagId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Note)
  declare note: BelongsTo<typeof Note>

  @belongsTo(() => Tag)
  declare tag: BelongsTo<typeof Tag>
}
