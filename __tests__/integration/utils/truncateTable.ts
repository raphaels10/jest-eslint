import { getConnection } from 'typeorm'

const truncateTable = async () => {
  const entities = getConnection().entityMetadatas
  return Promise.all(entities.map(entity => {
    const repository = getConnection().getRepository(entity.name)
    return repository.query(`DELETE FROM ${entity.tableName}`)
  }))
}

export default truncateTable
