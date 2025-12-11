import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

import Workspace from './workspace.js'
import User from './user.js'
import Tag from './tag.js'
import NoteHistory from './note_history.js'
import NoteVote from './note_vote.js'

export default class Note extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare workspaceId: number

  @column()
  declare authorId: number

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare type: string   // public / private

  @column()
  declare status: string // draft / published

  @column()
  declare upvotesCount: number

  @column()
  declare downvotesCount: number

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* ================================
   |   RELATIONSHIPS
   ================================= */

  @belongsTo(() => Workspace)
  declare workspace: BelongsTo<typeof Workspace>

  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>

  @manyToMany(() => Tag, {
    pivotTable: 'note_tags',
    pivotForeignKey: 'note_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof Tag>

  @hasMany(() => NoteHistory)
  declare history: HasMany<typeof NoteHistory>

  @hasMany(() => NoteVote)
  declare votes: HasMany<typeof NoteVote>
}
