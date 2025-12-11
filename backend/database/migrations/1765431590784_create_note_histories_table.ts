import { BaseSchema } from '@adonisjs/lucid/schema'

export default class NoteHistory extends BaseSchema {
  protected tableName = 'note_history'

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
        .onDelete('SET NULL')

      table.string('title').notNullable()
      table.text('content').notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now()).index()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
