import { BaseSchema } from '@adonisjs/lucid/schema'

export default class NoteVotes extends BaseSchema {
  protected tableName = 'note_votes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('note_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('notes')
        .onDelete('CASCADE')

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.enum('vote_type', ['upvote', 'downvote']).notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
